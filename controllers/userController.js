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
const saltRounds = 10;

// export const create = catchAsync(async (req, res, next) => {
//   try {
//     const { body } = req;
//     const branchIds = body.branch.map(id => parseInt(id));

//     body.email_id = body.email_id.toLowerCase();
//     body.created_by = req.user.id;

//     const user = await userModel.findOne({
//       where: {
//         [Op.or]: [
//           { email_id: body.email_id },
//           { contact_no: body.contact_no }
//         ]
//       }
//     });

//     if (user) {
//       if (user.email_id === body.email_id && user.contact_no !== body.contact_no) {
//         return next(new ApiError(httpStatus.BAD_REQUEST, `Email ${body.email_id} is already in use!`));
//       }
//       if (user.contact_no === body.contact_no && user.email_id !== body.email_id) {
//         return next(new ApiError(httpStatus.BAD_REQUEST, `Phone number ${body.contact_no} is already in use!`));
//       }
//       if (user.email_id === body.email_id && user.contact_no === body.contact_no) {
//         return next(new ApiError(httpStatus.BAD_REQUEST, 'User already exists'));
//       }
//     }

//     const resetPasswordToken = jwt.sign({ email_id: body.email_id }, secretKey, { expiresIn: '6h' });

//     let profileImageUrl;
//     if (req.file) {
//       profileImageUrl = `http://52.66.238.70/E-Seva/uploads/${req.file.originalname}`;
//     }

//     // Encrypt the password if it exists in the request body
//     let hashedPassword;
//     if (body.password) {
//       hashedPassword = await bcrypt.hash(body.password, saltRounds);
//     }

//     const userData = { ...body, resetPasswordToken };
//     if (hashedPassword) {
//       userData.password = hashedPassword;
//       userData.status = true;
//     }
//     if (profileImageUrl) {
//       userData.profile_image = profileImageUrl;
//     }

//     const createdUser = await userService.createUser(userData);

//     // Verify if the branch exists
//     const branches = await branchModel.findAll({
//       where: {
//         id: branchIds
//       }
//     });

//     const foundBranchIds = branches.map(branch => branch.id);
//     const notFoundBranchIds = branchIds.filter(id => !foundBranchIds.includes(id));

//     if (notFoundBranchIds.length > 0) {
//       return next(new ApiError(httpStatus.BAD_REQUEST, `Branches not found for IDs: ${notFoundBranchIds.join(', ')}`));
//     }

//     // Update the userBranchModel with the new branches
//     await Promise.all(branchIds.map(async (branchId) => {
//       const existingUserBranch = await userBranchModel.findOne({
//         where: {
//           userId: createdUser.id,
//           branchId: branchId,
//         }
//       });

//       if (!existingUserBranch) {
//         await userBranchModel.create({
//           userId: createdUser.id,
//           branchId: branchId,
//           status: true
//         });
//       }
//     }));

//     // Send the email only if the password is not provided
//     if (!body.password) {
//       const emailSubject = "Set Your Password";
//       const emailText = `To set your password, use the following URL: http://localhost:3000/set-password?token=${resetPasswordToken}`;
//       const emailHtml = `<p>To set your password, click <a href="http://localhost:3000/set-password?token=${resetPasswordToken}">here</a>.</p>`;

//       await mailService(body.email_id, emailSubject, emailText, emailHtml);
//     }

//     return res.send({
//       msg: "User created successfully",
//       results: createdUser,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ error: error.message });
//   }
// });

export const create = catchAsync(async (req, res, next) => {
    try {
      const { body } = req;
      const branchIds = body.branch.map(id => parseInt(id));
  
      body.email_id = body.email_id.toLowerCase();
      body.created_by = req.user.id;
  
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
  
      const resetPasswordToken = jwt.sign({ email_id: body.email_id }, secretKey, { expiresIn: '6h' });
  
      let profileImageUrl;
      if (req.file) {
        profileImageUrl = `${process.env.FILE_ACCESS_PATH}${req.file.filename}`;
      }
  
      // Encrypt the password if it exists in the request body
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
  
      // Verify if the branch exists
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
  
      // Update the userBranchModel with the new branches
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
  
      // Send the email only if the password is not provided
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
                    full_name: {
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
        const id = req.params.id;
        const updatedData = req.body;
        
        let profileImageUrl;
        if (req.file) {
            profileImageUrl = `http://52.66.238.70/E-Seva/uploads/${req.file.originalname}`;
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

        let user = await userModel.findOne({ where: { email_id } });

        if (!user) {
            user = await vendorModel.findOne({ where: { email_id } });
            if (user) {
                user.isVendor = true;
            }
        }

        if (!user) {
            return noUserErrorNext();
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return noUserErrorNext();
        }

        const userRole = await roleModel.findByPk(user.roleId);
        if (!userRole) {
            return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'User role not found'));
        }

        const token = genToken(user);

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
    const users = await userModel.findAll({
        where: {
            created_by: req.user.id,
            status: true
        }
    });
    return res.send({ msg: "Fetched User List Successfully.", data: users, total: users.length });
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
