import bcrypt from "bcrypt";
import path from "path";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import { userService } from "../services/index.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
import { genToken } from "../middlewares/passport.js";
import mailService from "../utils/mailService.js";
import { generateOTP } from "../utils/generateOtp.js";
import { secretKey } from "../middlewares/passport.js";
import dotenv from "dotenv";

dotenv.config();

const userModel = db.User;
const userStateToBranchModel = db.UserStateToBranch;
const roleModel = db.Role;
const vendorModel = db.Vendor;
const activityModel = db.Activity;
const saltRounds = 10;

export const create = catchAsync(async (req, res, next) => {
  try {
    const { body, file } = req;

    let profileImageUrl;
    if (req.file) {
      profileImageUrl = `${process.env.FILE_ACCESS_PATH}profileImages/${
        body.contact_number
      }${path.extname(req.file.originalname)}`;
    }

    body.email = body.email.toLowerCase();
    body.created_by = req.user.id;

    const userRole = await roleModel.findByPk(req.user.role_id);
    if (!userRole) {
      return next(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "User role not found")
      );
    }

    const existingUser = await userModel.findOne({
      where: {
        [Op.or]: [
          { email: body.email },
          { contact_number: body.contact_number },
        ],
      },
    });

    if (existingUser) {
      if (
        existingUser.email === body.email &&
        existingUser.contact_number !== body.contact_number
      ) {
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Email ${body.email} is already in use!`
          )
        );
      }
      if (
        existingUser.contact_number === body.contact_number &&
        existingUser.email !== body.email
      ) {
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Phone number ${body.contact_number} is already in use!`
          )
        );
      }
      if (
        existingUser.email === body.email &&
        existingUser.contact_number === body.contact_number
      ) {
        return next(
          new ApiError(httpStatus.BAD_REQUEST, "User already exists")
        );
      }
    }

    const resetPasswordToken = jwt.sign({ email: body.email }, secretKey, {
      expiresIn: "6h",
    });

    let hashedPassword;
    if (body.password) {
      hashedPassword = await bcrypt.hash(body.password, saltRounds);
    }

    const userData = { ...body, resetPasswordToken, status: true };
    if (hashedPassword) {
      userData.password = hashedPassword;
      userData.status = true;
    }
    if (profileImageUrl) {
      userData.profile_image = profileImageUrl;
    }

    const createdUser = await userService.createUser(userData);

    // Creating entry for the user in user_state_to_branch table
    const userStateToBranchData = {
      user_id: createdUser.id,
      state_id: body.state_id,
      division_id: -1,
      district_id: -1,
      taluk_id: -1,
      branch_id: -1,
      created_by: req.user.id,
      updated_by: req.user.id,
      status: true,
    };

    if (body.role_id === 8) {
      // RCS
      const createdUserEntry = await userStateToBranchModel.create(
        userStateToBranchData
      );
    } else if (body.role_id === 9) {
      // ARCS
      userStateToBranchData.division_id = body.division_id;
      // Support for multiple districts
      if (Array.isArray(body.district_id)) {
        body.district_id.forEach(async (districtId) => {
          let _userStateToBranchData = { ...userStateToBranchData };
          _userStateToBranchData.district_id = districtId;
          const createdUserEntry = await userStateToBranchModel.create(
            _userStateToBranchData
          );
        });
      } else {
        userStateToBranchData.district_id = body.district_id;
        const createdUserEntry = await userStateToBranchModel.create(
          userStateToBranchData
        );
      }
    } else if (body.role_id === 7) {
      // Deputy Registrar
      userStateToBranchData.division_id = body.division_id;
      // Support for multiple districts
      if (Array.isArray(body.district_id)) {
        body.district_id.forEach(async (districtId) => {
          let _userStateToBranchData = { ...userStateToBranchData };
          _userStateToBranchData.district_id = districtId;
          const createdUserEntry = await userStateToBranchModel.create(
            _userStateToBranchData
          );
        });
      } else {
        userStateToBranchData.district_id = body.district_id;
        const createdUserEntry = await userStateToBranchModel.create(
          userStateToBranchData
        );
      }
    } else if (body.role_id === 6) {
      // Assistant Registrar
      userStateToBranchData.division_id = body.division_id;
      userStateToBranchData.district_id = body.district_id;
      // Support for multiple taluks
      if (Array.isArray(body.taluk_id)) {
        body.taluk_id.forEach(async (talukId) => {
          let _userStateToBranchData = { ...userStateToBranchData };
          _userStateToBranchData.taluk_id = talukId;
          const createdUserEntry = await userStateToBranchModel.create(
            _userStateToBranchData
          );
        });
      } else {
        userStateToBranchData.taluk_id = body.taluk_id;
        const createdUserEntry = await userStateToBranchModel.create(
          userStateToBranchData
        );
      }
    } else if (body.role_id === 10) {
      // Branch Registrar
      userStateToBranchData.division_id = body.division_id;
      userStateToBranchData.district_id = body.district_id;
      userStateToBranchData.taluk_id = body.taluk_id;
      // Support for multiple branches
      if (Array.isArray(body.branch_id)) {
        body.branch_id.forEach(async (branchId) => {
          let _userStateToBranchData = { ...userStateToBranchData };
          _userStateToBranchData.branch_id = branchId;
          const createdUserEntry = await userStateToBranchModel.create(
            _userStateToBranchData
          );
        });
      } else {
        userStateToBranchData.branch_id = body.branch_id;
        const createdUserEntry = await userStateToBranchModel.create(
          userStateToBranchData
        );
      }
    } else if (body.role_id === 3) {
      // Squad
      userStateToBranchData.state_id = req.user.state_id;
      userStateToBranchData.division_id = req.user.division_id;
      userStateToBranchData.district_id = req.user.district_id;
      userStateToBranchData.taluk_id = req.user.taluk_id;
      // Support for multiple branches
      if (Array.isArray(body.branch_id)) {
        body.branch_id.forEach(async (branchId) => {
          let _userStateToBranchData = { ...userStateToBranchData };
          _userStateToBranchData.branch_id = branchId;
          const createdUserEntry = await userStateToBranchModel.create(
            _userStateToBranchData
          );
        });
      } else {
        userStateToBranchData.branch_id = body.branch_id;
        const createdUserEntry = await userStateToBranchModel.create(
          userStateToBranchData
        );
      }
    } else if (body.role_id === 2) {
      // Supervisor
      // Support for multiple branches
      if (Array.isArray(body.branch_id)) {
        body.branch_id.forEach(async (branchId) => {
          let _userStateToBranchData = { ...userStateToBranchData };
          const branchTaluk = await db.Branch.findOne({
            where: { id: branchId },
          });
          const talukDistrict = await db.Taluk.findOne({
            where: { id: branchTaluk.taluk_id },
          });
          const districtDivision = await db.District.findOne({
            where: { id: talukDistrict.district_id },
          });
          const divisionState = await db.Division.findOne({
            where: { id: districtDivision.division_id },
          });
          _userStateToBranchData.taluk_id = branchTaluk.taluk_id;
          _userStateToBranchData.district_id = talukDistrict.district_id;
          _userStateToBranchData.division_id = districtDivision.division_id;
          _userStateToBranchData.state_id = divisionState.state_id;
          _userStateToBranchData.branch_id = branchId;
          const createdUserEntry = await userStateToBranchModel.create(
            _userStateToBranchData
          );
        });
      } else {
        userStateToBranchData.branch_id = body.branch_id;
        const branchTaluk = await db.Branch.findOne({
          where: { id: body.branch_id },
        });
        const talukDistrict = await db.Taluk.findOne({
          where: { id: branchTaluk.taluk_id },
        });
        const districtDivision = await db.District.findOne({
          where: { id: talukDistrict.district_id },
        });
        const divisionState = await db.Division.findOne({
          where: { id: districtDivision.division_id },
        });
        userStateToBranchData.taluk_id = branchTaluk.taluk_id;
        userStateToBranchData.district_id = talukDistrict.district_id;
        userStateToBranchData.division_id = districtDivision.division_id;
        userStateToBranchData.state_id = divisionState.state_id;
        const createdUserEntry = await userStateToBranchModel.create(
          userStateToBranchData
        );
      }
    } else if (body.role_id === 4) {
      // User
      userStateToBranchData.branch_id = body.branch_id;
      const branchTaluk = await db.Branch.findOne({
        where: { id: body.branch_id },
      });
      const talukDistrict = await db.Taluk.findOne({
        where: { id: branchTaluk.taluk_id },
      });
      const districtDivision = await db.District.findOne({
        where: { id: talukDistrict.district_id },
      });
      const divisionState = await db.Division.findOne({
        where: { id: districtDivision.division_id },
      });
      userStateToBranchData.taluk_id = branchTaluk.taluk_id;
      userStateToBranchData.district_id = talukDistrict.district_id;
      userStateToBranchData.division_id = districtDivision.division_id;
      userStateToBranchData.state_id = divisionState.state_id;
      const createdUserEntry = await userStateToBranchModel.create(
        userStateToBranchData
      );
    }

    const activityData = {
      activity_title: "User Created",
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

      await mailService(body.email, emailSubject, emailText, emailHtml);
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
    const email = decodedToken.email;

    let user = await userModel.findOne({ where: { email } });

    if (!user) {
      user = await vendorModel.findOne({ where: { email } });
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

const fillUserStateToBranchFilter = async (req, filter) => {
  if (req.user.role_id === 8) {
    // RCS
    const userState = await userStateToBranchModel.findAll({
      where: {
        user_id: req.user.id,
        status: true,
      },
      attributes: ["state_id"],
    });
    filter.state_id = userState.map((user) => user.state_id);
  } else if (req.user.role_id === 9) {
    // ARCS
    const userDistricts = await userStateToBranchModel.findAll({
      where: {
        user_id: req.user.id,
        status: true,
      },
      attributes: ["district_id"],
    });
    filter.district_id = userDistricts.map((user) => user.district_id);
  } else if (req.user.role_id === 7) {
    // Deputy Registrar
    const userDistricts = await userStateToBranchModel.findAll({
      where: {
        user_id: req.user.id,
        status: true,
      },
      attributes: ["district_id"],
    });
    filter.district_id = userDistricts.map((user) => user.district_id);
  } else if (req.user.role_id === 6) {
    // Assistant Registrar
    const userTaluks = await userStateToBranchModel.findAll({
      where: {
        user_id: req.user.id,
        status: true,
      },
      attributes: ["taluk_id"],
    });
    filter.taluk_id = userTaluks.map((user) => user.taluk_id);
  } else if (req.user.role_id === 10) {
    // Branch Registrar
    const userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: req.user.id,
        status: true,
      },
      attributes: ["branch_id"],
    });
    filter.branch_id = userBranches.map((user) => user.branch_id);
  }

  return filter;
};

export const getAll = catchAsync(async (req, res) => {
  try {
    const { qFilter, page, pageSize, search } = req.query;
    const userId = req.user.id;
    const userRole = await roleModel.findByPk(req.user.role_id);

    let filter = {
      status: true,
    };

    if (qFilter) {
      filter = {
        ...JSON.parse(qFilter),
      };
    }

    if (search) {
      const searchTerm = search.trim();
      if (searchTerm !== "") {
        filter = {
          ...filter,
          full_name: {
            [Op.like]: `%${searchTerm}%`,
          },
        };
      }
    }

    // Exclude 'Admin' role for non-admin users
    let userIds = [];
    if (req.user.role_id !== 1) {
      const _userFilter = await fillUserStateToBranchFilter(req, {});
      _userFilter.status = true;
      const _users = await userStateToBranchModel.findAll({
        where: { ..._userFilter },
        attributes: ["user_id"],
      });

      const _userModelFilter = {
        status: true,
      };

      _userModelFilter.id = _users.map((user) => user.user_id);

      const users = await userModel.findAll({
        where: _userModelFilter,
        attributes: ["id"],
      });
      userIds = users.map((user) => user.id);
      filter.id = {
        [Op.in]: userIds,
      };
    }

    const pageNumber = parseInt(page) || 1;
    const limit = parseInt(pageSize) || 10;
    const offset = (pageNumber - 1) * limit;

    const users = await userModel.findAll({
      where: filter,
      offset: offset,
      limit: limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: roleModel,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    const totalCount = await userModel.count({
      where: filter,
      include: [
        {
          model: roleModel,
          as: "role",
          attributes: ["name"],
        },
      ],
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
    return res.status(500).send({ error: "Internal Server Error" });
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

    const [rowsUpdated, updatedUsers] = await userService.updateOneUser(
      id,
      userData
    );

    if (rowsUpdated === 0) {
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `User with id ${id} doesn't exist!`
        )
      );
    }

    return res.send({
      message: "User updated successfully",
      rowsUpdated,
      updatedUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const getUserById = catchAsync(async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await userService.getById(id);
    if (!user) {
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `User with id ${id} does not exist!`
        )
      );
    }
    return res.send(user);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const login = catchAsync(async (req, res, next) => {
  try {
    const { password } = req.body;
    let { email } = req.body;
    email = email.toLowerCase();

    const noUserErrorNext = () =>
      next(
        new ApiError(httpStatus.BAD_REQUEST, "Invalid Email ID or Password")
      );

    // Find user by email in user model
    let user = await userModel.findOne({ where: { email } });

    // If user not found, find user in vendor model
    if (!user) {
      user = await vendorModel.findOne({ where: { email } });
      if (user) {
        user.isVendor = true;
      }
    }

    // If no user found in both models
    if (!user) {
      return noUserErrorNext();
    }

    // Retrieve user role
    const userRole = await roleModel.findByPk(user.role_id);
    if (!userRole) {
      return next(
        new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "User role not found")
      );
    }

    // Check if user is active
    if (!user.status) {
      return next(new ApiError(httpStatus.FORBIDDEN, "User is inactive"));
    }

    // Check password validity
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return noUserErrorNext();
    }

    // Log user activity
    const userActivity = await activityModel.create({
      activity_title: "Login",
      activity_description: "User logged in",
      activity_created_by_id: user.id,
      activity_created_by_type: userRole.name,
      activity_created_at: new Date(),
    });

    // Check if activity was successfully logged
    if (!userActivity) {
      return next(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to create activity"
        )
      );
    }

    // Generate token
    const token = genToken(user);

    // Send response
    return res.send({
      status: true,
      msg: "Logged in successfully",
      user,
      token,
      role: userRole.name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  try {
    const { email } = req.body;

    let user = await userModel.findOne({ where: { email } });

    if (!user) {
      user = await vendorModel.findOne({ where: { email } });
      if (!user) {
        return next(new ApiError(httpStatus.NOT_FOUND, "User not found"));
      }
    }

    const otp = generateOTP();

    user.reset_otp = otp;
    user.reset_otp_expiration = new Date(Date.now() + 5 * 60000);
    await user.save();

    const emailSubject = "Password Reset OTP";
    const emailHtml = `Your OTP for password reset is: ${otp}`;
    await mailService(user.email, emailSubject, null, emailHtml);

    return res.send({ message: "OTP sent for password reset." });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const verifyOTP = catchAsync(async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    let user = await userModel.findOne({ where: { email } });

    if (!user) {
      user = await vendorModel.findOne({ where: { email } });
      if (!user) {
        return next(new ApiError(httpStatus.NOT_FOUND, "User not found"));
      }
    }

    if (user.reset_otp !== otp || user.reset_otp_expiration < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await userModel.findOne({ where: { email } });

    if (!user) {
      user = await vendorModel.findOne({ where: { email } });
      if (!user) {
        return next(new ApiError(httpStatus.NOT_FOUND, "User not found"));
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.reset_otp = undefined;
    user.reset_otp_expiration = undefined;

    await user.save();

    return res.send({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

// export const getMyTeamUserList = catchAsync(async (req, res, next) => {
//     try {
//         const { qFilter, search } = req.query;

//         let filter = {
//             status: true
//         };

//         const _userFilter = fillUserStateToBranchFilter(req, {});
//         _userFilter.status = 1;
//         const filteredUsers = await userModel.findAll({
//             where: _userFilter,
//             attributes: ['id']
//         });
//         const filteredUserIds = filteredUsers.map(user => user.id);
//         filter.id = {
//             [Op.in]: filteredUserIds
//         };

//         if (qFilter) {
//             filter = {
//                 ...filter,
//                 ...JSON.parse(qFilter),
//             };
//         }

//         if (search) {
//             const searchTerm = search.trim();
//             if (searchTerm !== '') {
//                 filter = {
//                     ...filter,
//                     full_name: {
//                         [Op.like]: `%${searchTerm}%`
//                     }
//                 };
//             }
//         }

//         const users = await userModel.findAll({
//             where: filter,
//             order: [['created_at', 'DESC']]
//         });

//         return res.send({ msg: "Fetched User List Successfully.", data: users, total: users.length });
//     } catch (error) {
//         console.log(error.toString())
//         return res.status(500).send({ error: 'Internal Server Error',errorMessage: error.toString() });
//     }
// });

export const getMyTeamUserList = catchAsync(async (req, res, next) => {
  try {
    const { qFilter, search } = req.query;

    let filter = {
      // status: true  // Assuming status is a boolean
    };

    const _userFilter = await fillUserStateToBranchFilter(req, {});
    _userFilter.status = true; // Assuming status is a boolean

    const _users = await userStateToBranchModel.findAll({
      where: { ..._userFilter },
      attributes: ["user_id"],
    });

    const _userModelFilter = {
      status: true,
    };

    _userModelFilter.id = _users.map((user) => user.user_id);

    if (req.user.role_id === 3) {
      // Squad
      _userModelFilter.role_id = [2, 4];
    } else if (req.user.role_id === 2) {
      // Supervisor
      _userModelFilter.role_id = [4];
    } else if (req.user.role_id === 4) {
      // User
      _userModelFilter.role_id = [4];
      _userModelFilter.id = req.user.id;
    }

    const filteredUsers = await userModel.findAll({
      where: _userModelFilter,
      attributes: ["id"],
    });
    const filteredUserIds = filteredUsers.map((user) => user.id);
    filter.id = {
      [Op.in]: filteredUserIds,
    };

    if (qFilter) {
      filter = {
        ...filter,
        ...JSON.parse(qFilter),
      };
    }

    if (search) {
      const searchTerm = search.trim();
      if (searchTerm !== "") {
        filter = {
          ...filter,
          full_name: {
            [Op.like]: `%${searchTerm}%`,
          },
        };
      }
    }

    const users = await userModel.findAll({
      where: filter,
      order: [["created_at", "DESC"]],
    });

    return res.send({
      msg: "Fetched User List Successfully.",
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.log(error.toString());
    return res
      .status(500)
      .send({ error: "Internal Server Error", errorMessage: error.toString() });
  }
});

export const activateUser = catchAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;

    console.log(userId, "userId");

    const user = await userModel.findOne({
      where: {
        id: userId,
        status: false,
      },
    });

    if (!user) {
      return next(new ApiError(httpStatus.NOT_FOUND, "User not found"));
    }

    user.status = true;
    await user.save();

    return res.send({
      status: true,
      message: "User activated successfully",
      user,
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const deactivateUser = catchAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;

    console.log(userId, "userId");

    const user = await userModel.findOne({
      where: {
        id: userId,
        status: true,
      },
    });

    if (!user) {
      return next(new ApiError(httpStatus.NOT_FOUND, "User not found"));
    }

    user.status = false;
    await user.save();

    return res.send({
      status: true,
      message: "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});
