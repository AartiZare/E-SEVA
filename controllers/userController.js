import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import { userService } from '../services/index.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
import { genToken } from '../middlewares/passport.js';
import mailService from "../utils/mailService.js";
import { generateOTP } from "../utils/generateOtp.js";
const userModel = db.Users;
const roleModel = db.Roles;

export const create = catchAsync(async (req, res, next) => {
  try {
    const { body } = req;
    // console.log(req.user, "logged in user")
    // body.created_by = req.user.id;
    body.email_id = body.email_id.toLowerCase();
    const user = await userModel.findOne({
      where: {
        [Op.or]: [
          { email_id: body.email_id },
          { contact_no: body.contact_no }
        ]
      }
    });

    if (user) {
      if (user.email_id === body.email_id && user.contact_no !== body.contact_no) {
        return next(new ApiError(httpStatus.BAD_REQUEST, `Email ${body.email_id} is already in use!`));
      }
      if (user.contact_no === body.contact_no && user.email_id !== body.email_id) {
        return next(new ApiError(httpStatus.BAD_REQUEST, `Phone number ${body.contact_no} is already in use!`));
      }
      if (user.email_id === body.email_id && user.contact_no === body.contact_no) {
        return next(new ApiError(httpStatus.BAD_REQUEST, 'User already exists'));
      }
    }

    const resetPasswordToken = genToken({ email: body.email_id });
    const createdUser = await userService.createUser({ ...body, resetPasswordToken });

    const emailSubject = "Set Your Password";
    const emailText = `To set your password, use the following URL: http://localhost:8080/reset-password?token=${resetPasswordToken}`;
    const emailHtml = `<p>To set your password, click <a href="http://localhost:8080/reset-password?token=${resetPasswordToken}">here</a>.</p>`;

    await mailService(body.email_id, emailSubject, emailText, emailHtml);

    return res.send({
      msg: "User created successfully",
      results: createdUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

export const getAll = catchAsync(async (req, res) => {
    try {
        const { qFilter } = req.query;
        let filter = {};
        if (qFilter) {
            filter = {
                ...JSON.parse(qFilter),
            };
        }
        let page = parseInt(req.query.page) || 1;
        let pageSize = parseInt(req.query.pageSize) || 10;
        if (req.query.search) {
            const searchTerm = req.query.search.trim();
            if (searchTerm !== '') {
                filter = {
                    name: {
                        [Op.like]: `%${searchTerm}%`
                    }
                };
            }
        }
        const query = {
            ...filter,
        };

        const users = await userService.getAll(query, page, pageSize);
        return res.send(users);
    } catch (error) {
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});


export const update = catchAsync(async (req, res, next) => {
    try {
        // const { body } = req;
        const id = req.params.id;
        const updatedData = req.body;
        // body.updated_by = req.user.id;
        // const role = await roleModel.findByPk(req.user.roleId);
       
        // if(role){
        //     if(role.type !== enumModel.EnumtypeOfRole.ADMIN){
        //         return next(new ApiError(httpStatus.BAD_REQUEST, `Only Admin has access to edit user details!`));
        //     }
        // }
        const [rowsUpdated, updatedUsers] = await userService.updateOneUser(id, updatedData);

        if (rowsUpdated === 0) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `User with id ${id} doesn't exist!`));
        }
        return res.send({ message: 'User updated successfully', rowsUpdated, updatedUsers });
    } catch (error) {
        console.log(error);
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
        return res.send(user)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const login = catchAsync(async (req, res, next) => {
    try {
        const { password } = req.body;
        let { email_id } = req.body;
        email_id = email_id.toLowerCase();

        const noUserErrorNext = () => next(new ApiError(httpStatus.BAD_REQUEST, 'Invalid Email ID or Password'));
        let user = await userModel.findOne({ where: { email_id: req.body.email_id } });
        console.log(user, "user")

        if (!user) {
            return noUserErrorNext();
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return noUserErrorNext();
        }

        // Check user role
        const userRole = await roleModel.findByPk(user.roleId);
        console.log(userRole, "User roles");

        if (!userRole) {
            return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'User role not found'));
        }

        // Generate token
        const token = genToken(user);
        
        // Return login response with user's role
        return res.send({ status: true,  msg: "Logged in successfully", user: user, token: token, role: userRole.name });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const forgotPassword = catchAsync(async (req, res, next) => {
    try {
        const { email_id } = req.body;
        const user = await userModel.findOne({ where: { email_id } });

        if (!user) {
            return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP and its expiration time in user document
        user.resetOTP = otp;
        user.resetOTPExpiration = new Date(Date.now() + 5 * 60000);
        await user.save();

        // Send OTP via email
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

        const user = await userModel.findOne({ where: { email_id } });

        if (!user) {
            return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
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
        const user = await userModel.findOne({ where: { email_id } });

        if (!user) {
            return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
        }

        // Update user's password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Clear reset OTP fields
        user.resetOTP = undefined;
        user.resetOTPExpiration = undefined;

        await user.save();

        return res.send({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});
