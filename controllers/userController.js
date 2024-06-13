import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import jwt from "jsonwebtoken";
import { catchAsync } from '../utils/catchAsync.js';
import { userService } from '../services/index.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
import { genToken } from '../middlewares/passport.js';
import mailService from "../utils/mailService.js";
import { generateOTP } from "../utils/generateOtp.js";
import { secretKey } from '../middlewares/passport.js'; 
import dotenv from 'dotenv';

dotenv.config();

const userModel = db.Users;
const roleModel = db.Roles;
const vendorModel = db.Vendor;
const branchModel = db.Branch;
const userBranchModel = db.UserBranch;
const activityModel = db.Activity;
const saltRounds = 10;

export const create = catchAsync(async (req, res, next) => {
    try {
        const { body, file } = req;

        // Ensure branch is an array if it is defined, otherwise default to an empty array
        const branchIds = Array.isArray(body.branch) ? body.branch.map(id => parseInt(id)) : [];

        body.email_id = body.email_id.toLowerCase();
        body.created_by = req.user.id;

        const userRole = await roleModel.findByPk(req.user.roleId);
        if (!userRole) {
            return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'User role not found'));
        }

        const existingUser = await userModel.findOne({
            where: {
                [Op.or]: [
                    { email_id: body.email_id },
                    { contact_no: body.contact_no }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email_id === body.email_id && existingUser.contact_no !== body.contact_no) {
                return next(new ApiError(httpStatus.BAD_REQUEST, `Email ${body.email_id} is already in use!`));
            }
            if (existingUser.contact_no === body.contact_no && existingUser.email_id !== body.email_id) {
                return next(new ApiError(httpStatus.BAD_REQUEST, `Phone number ${body.contact_no} is already in use!`));
            }
            if (existingUser.email_id === body.email_id && existingUser.contact_no === body.contact_no) {
                return next(new ApiError(httpStatus.BAD_REQUEST, 'User already exists'));
            }
        }

        const resetPasswordToken = jwt.sign({ email_id: body.email_id }, secretKey, { expiresIn: '6h' });

        let profileImageUrl;
        if (file) {
            profileImageUrl = `${process.env.FILE_ACCESS_PATH}profileImages/${file.originalname}`;
        }

        let hashedPassword;
        if (body.password) {
            hashedPassword = await bcrypt.hash(body.password, saltRounds);
        }

        const userData = { ...body, resetPasswordToken };
        if (hashedPassword) {
            userData.password = hashedPassword;
            userData.status = true;
        }
        if (profileImageUrl) {
            userData.profile_image = profileImageUrl;
        }

        const createdUser = await userService.createUser(userData);

        const branches = await branchModel.findAll({
            where: {
                id: branchIds
            }
        });

        const foundBranchIds = branches.map(branch => branch.id);
        const notFoundBranchIds = branchIds.filter(id => !foundBranchIds.includes(id));

        if (notFoundBranchIds.length > 0) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `Branches not found for IDs: ${notFoundBranchIds.join(', ')}`));
        }

        await Promise.all(branchIds.map(async (branchId) => {
            const existingUserBranch = await userBranchModel.findOne({
                where: {
                    userId: createdUser.id,
                    branchId: branchId,
                }
            });

            if (!existingUserBranch) {
                await userBranchModel.create({
                    userId: createdUser.id,
                    branchId: branchId,
                    status: true
                });
            }
        }));

        const activityData = {
            Activity_title: 'User Created',
            activity_description: `User ${createdUser.full_name} was created.`,
            activity_created_by_id: req.user.id,
            activity_created_by_type: userRole.name,
            activity_created_at: new Date(),
        };

        await activityModel.create(activityData);

        if (!body.password) {
            const emailSubject = "Set Your Password";
            const emailText = `To set your password, use the following URL: http://localhost:3000/set-password?token=${resetPasswordToken}`;
            const emailHtml = `<p>To set your password, click <a href="http://localhost:3000/set-password?token=${resetPasswordToken}">here</a>.</p>`;

            await mailService(body.email_id, emailSubject, emailText, emailHtml);
        }

        return res.send({
            msg: "User created successfully",
            results: createdUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
});

export const set_password = catchAsync(async (req, res, next) => {
    try {
        const { password } = req.body;
        const token = req.headers.authorization.split(" ")[1];
        if (!password) {
            return res.status(400).send("Password is required");
        }

        const decodedToken = jwt.verify(token, secretKey);
        const email_id = decodedToken.email_id;

        let user = await userModel.findOne({ where: { email_id } });

        if (!user) {
            user = await vendorModel.findOne({ where: { email_id } });
            if (!user) {
                return res.status(404).send("User does not exist.");
            }
        }

        const encryptedUserPassword = await bcrypt.hash(password, 10);
        user.password = encryptedUserPassword;
        user.status = true;
        await user.save();

        return res.status(200).json({ user, msg: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
});

export const getAll = catchAsync(async (req, res) => {
    try {
        const { qFilter, page, pageSize, search } = req.query;
        const userId = req.user.id;
        const userRole = await roleModel.findByPk(req.user.roleId);

        let filter = {};

        if (qFilter) {
            filter = {
                ...JSON.parse(qFilter),
            };
        }

        if (search) {
            const searchTerm = search.trim();
            if (searchTerm !== '') {
                filter = {
                    ...filter,
                    full_name: {
                        [Op.like]: `%${searchTerm}%`,
                    },
                };
            }
        }

        // Exclude 'Admin' role for non-admin users
        if (userRole.name !== 'Admin') {
            filter = {
                ...filter,
                '$role.name$': {
                    [Op.ne]: 'Admin',
                },
            };

            if (['RCS', 'ARCS', 'Assistant Registrar', 'Deputy Registrar', 'Branch Registrar'].includes(userRole.name)) {
                filter = {
                    ...filter,
                    created_by: userId,
                    '$role.name$': {
                        [Op.and]: [
                            { [Op.ne]: 'Admin' },
                            { [Op.notIn]: ['Squad', 'Supervisor', 'User', 'Vendor'] }
                        ],
                    },
                };
            } else if (['Squad', 'Supervisor', 'User'].includes(userRole.name)) {
                filter = {
                    ...filter,
                    created_by: userId,
                };
            }
        }

        const pageNumber = parseInt(page) || 1;
        const limit = parseInt(pageSize) || 10;
        const offset = (pageNumber - 1) * limit;

        const users = await userModel.findAll({
            where: filter,
            offset: offset,
            limit: limit,
            order: [['createdAt', 'DESC']],
            include: [{
                model: roleModel,
                as: 'role',
                attributes: ['name']
            }]
        });

        const totalCount = await userModel.count({
            where: filter,
            include: [{
                model: roleModel,
                as: 'role',
                attributes: ['name']
            }]
        });

        const response = {
            users,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNumber,
            pageSize: limit,
        };

        return res.send(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const update = catchAsync(async (req, res, next) => {
    try {
        const id = req.params.id;
        const { file } = req;
        const updatedData = req.body;
        
        let profileImageUrl;
        if (req.file) {
            // profileImageUrl = `http://52.66.238.70/E-Seva/uploads/${req.file.originalname}`;
            profileImageUrl = `${process.env.FILE_ACCESS_PATH}profileImages/${file.originalname}`;
        }

        const userData = { ...updatedData };
        if (profileImageUrl) {
            userData.profile_image = profileImageUrl;
        }

        const [rowsUpdated, updatedUsers] = await userService.updateOneUser(id, userData);

        if (rowsUpdated === 0) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `User with id ${id} doesn't exist!`));
        }
        
        return res.send({ message: 'User updated successfully', rowsUpdated, updatedUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const getUserById = catchAsync(async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await userService.getById(id);
        if (!user) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `User with id ${id} does not exist!`));
        }
        return res.send(user);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const login = catchAsync(async (req, res, next) => {
    try {
        const { password } = req.body;
        let { email_id } = req.body;
        email_id = email_id.toLowerCase();

        const noUserErrorNext = () => next(new ApiError(httpStatus.BAD_REQUEST, 'Invalid Email ID or Password'));

        // Find user by email in user model
        let user = await userModel.findOne({ where: { email_id } });

        // If user not found, find user in vendor model
        if (!user) {
            user = await vendorModel.findOne({ where: { email_id } });
            if (user) {
                user.isVendor = true;
            }
        }

        // If no user found in both models
        if (!user) {
            return noUserErrorNext();
        }

        // Retrieve user role
        const userRole = await roleModel.findByPk(user.roleId);
        if (!userRole) {
            return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'User role not found'));
        }

        // Check if user is active
        if (!user.status) {
            return next(new ApiError(httpStatus.FORBIDDEN, 'User is inactive'));
        }

        // Check password validity
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return noUserErrorNext();
        }

        // Log user activity
        const userActivity = await activityModel.create({
            Activity_title: 'Login',
            activity_description: 'User logged in',
            activity_created_by_id: user.id,
            activity_created_by_type: userRole.name,
            activity_created_at: new Date()
        });

        // Check if activity was successfully logged
        if (!userActivity) {
            return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create activity'));
        }

        // Generate token
        const token = genToken(user);

        // Send response
        return res.send({ 
            status: true, 
            msg: "Logged in successfully", 
            user, 
            token, 
            role: userRole.name 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const forgotPassword = catchAsync(async (req, res, next) => {
    try {
        const { email_id } = req.body;

        let user = await userModel.findOne({ where: { email_id } });
        
        if (!user) {
            user = await vendorModel.findOne({ where: { email_id } });
            if (!user) {
                return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
            }
        }

        const otp = generateOTP();

        user.resetOTP = otp;
        user.resetOTPExpiration = new Date(Date.now() + 5 * 60000);
        await user.save();

        const emailSubject = "Password Reset OTP";
        const emailHtml = `Your OTP for password reset is: ${otp}`;
        await mailService(user.email_id, emailSubject, null, emailHtml);

        return res.send({ message: "OTP sent for password reset." });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const verifyOTP = catchAsync(async (req, res, next) => {
    try {
        const { email_id, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }

        let user = await userModel.findOne({ where: { email_id } });

        if (!user) {
            user = await vendorModel.findOne({ where: { email_id } });
            if (!user) {
                    return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
                }
            }
    
            if (user.resetOTP !== otp || user.resetOTPExpiration < new Date()) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
    
            return res.status(200).json({ message: "OTP verified successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    });
    
    export const resetPassword = catchAsync(async (req, res, next) => {
        try {
            const { email_id, password } = req.body;
    
            let user = await userModel.findOne({ where: { email_id } });
    
            if (!user) {
                user = await vendorModel.findOne({ where: { email_id } });
                if (!user) {
                    return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
                }
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
    
            user.resetOTP = undefined;
            user.resetOTPExpiration = undefined;
    
            await user.save();
    
            return res.send({ message: "Password reset successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    });
    

    export const getMyTeamUserList = catchAsync(async (req, res, next) => {
        try {
            const { qFilter, search } = req.query;
            let filter = {
                created_by: req.user.id,
                status: true
            };
    
            if (qFilter) {
                filter = {
                    ...filter,
                    ...JSON.parse(qFilter),
                };
            }
    
            if (search) {
                const searchTerm = search.trim();
                if (searchTerm !== '') {
                    filter = {
                        ...filter,
                        full_name: {
                            [Op.like]: `%${searchTerm}%`
                        }
                    };
                }
            }
    
            const users = await userModel.findAll({
                where: filter,
                order: [['createdAt', 'DESC']]
            });
    
            return res.send({ msg: "Fetched User List Successfully.", data: users, total: users.length });
        } catch (error) {
            return res.status(500).send({ error: 'Internal Server Error' });
        }
    });

export const activateUser = catchAsync(async (req, res, next) => {
    try {
        const { userId } = req.params;

        console.log(userId, "userId");

        const user = await userModel.findOne({
            where: {
                id: userId,
                status: false
            }
        });

        if (!user) {
            return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
        }

        user.status = true;
        await user.save();

        return res.send({ status: true, message: 'User activated successfully', user });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const deactivateUser = catchAsync(async (req, res, next) => {
    try {
        const { userId } = req.params;

        console.log(userId, "userId");

        const user = await userModel.findOne({
            where: {
                id: userId,
                status: true
            }
        });

        if (!user) {
            return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
        }

        user.status = false;
        await user.save();

        return res.send({ status: true, message: 'User deactivated successfully', user });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});
