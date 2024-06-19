import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import mailService from "../utils/mailService.js";
import { secretKey } from "../middlewares/passport.js";
import db from "../models/index.js";
const vendorModel = db.Vendor;

export const createVendor = catchAsync(async (req, res, next) => {
  try {
    const { body } = req;
    body.email = body.email.toLowerCase();

    const vendor = await vendorModel.findOne({
      where: {
        [Op.or]: [
          { email: body.email },
          { contact_number: body.contact_number },
        ],
      },
    });

    if (vendor) {
      if (
        vendor.email === body.email &&
        vendor.contact_number !== body.contact_number
      ) {
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Email ${body.email} is already in use!`
          )
        );
      }
      if (
        vendor.contact_number === body.contact_number &&
        vendor.email !== body.email
      ) {
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            `Phone number ${body.contact_number} is already in use!`
          )
        );
      }
      if (
        vendor.email === body.email &&
        vendor.contact_number === body.contact_number
      ) {
        return next(
          new ApiError(httpStatus.BAD_REQUEST, "Vendor already exists")
        );
      }
    }

    const resetPasswordToken = jwt.sign({ email: body.email }, secretKey, {
      expiresIn: "10h",
    });

    const resetPasswordTokenExpiry = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 hours from now

    let profileImageUrl;
    if (req.file) {
      profileImageUrl = `http://52.66.238.70/E-Seva/uploads/${req.file.originalname}`;
    }

    const vendorData = { ...body, resetPasswordToken, resetPasswordTokenExpiry };
    if (profileImageUrl) {
      vendorData.profile_image = profileImageUrl;
    }

    const createdVendor = await vendorModel.create(vendorData);

    const emailSubject = "Set Your Password";
    const emailText = `To set your password, use the following URL: http://localhost:3000/set-password?token=${resetPasswordToken}`;
    const emailHtml = `<p>To set your password, click <a href="http://localhost:3000/set-password?token=${resetPasswordToken}">here</a>.</p>`;

    await mailService(body.email, emailSubject, emailText, emailHtml);

    return res.send({
      msg: "Vendor created successfully",
      results: createdVendor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const getAllVendors = catchAsync(async (req, res) => {
  try {
    const { qFilter, page, pageSize, search } = req.query;
    let filter = {};

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

    const pageNumber = parseInt(page) || 1;
    const limit = parseInt(pageSize) || 10;
    const offset = (pageNumber - 1) * limit;

    const vendors = await vendorModel.findAll({
      where: filter,
      offset: offset,
      limit: limit,
    });

    const totalCount = await vendorModel.count({
      where: filter,
    });

    // Prepare response object with paginated results
    const response = {
      vendors,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: pageNumber,
      pageSize: limit,
    };

    // Send response
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});
