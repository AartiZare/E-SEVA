import { Op } from 'sequelize';
import jwt from "jsonwebtoken";
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import mailService from "../utils/mailService.js";
import { secretKey } from '../middlewares/passport.js'; 
import db from '../models/index.js';
const vendorModel = db.Vendor;

export const createVendor = catchAsync(async (req, res, next) => {
  try {
    const { body } = req;
    body.email_id = body.email_id.toLowerCase();

    const vendor = await vendorModel.findOne({
      where: {
        [Op.or]: [
          { email_id: body.email_id },
          { contact_no: body.contact_no }
        ]
      }
    });

    if (vendor) {
      if (vendor.email_id === body.email_id && vendor.contact_no !== body.contact_no) {
        return next(new ApiError(httpStatus.BAD_REQUEST, `Email ${body.email_id} is already in use!`));
      }
      if (vendor.contact_no === body.contact_no && vendor.email_id !== body.email_id) {
        return next(new ApiError(httpStatus.BAD_REQUEST, `Phone number ${body.contact_no} is already in use!`));
      }
      if (vendor.email_id === body.email_id && vendor.contact_no === body.contact_no) {
        return next(new ApiError(httpStatus.BAD_REQUEST, 'Vendor already exists'));
      }
    }

    const resetPasswordToken = jwt.sign({ email_id: body.email_id }, secretKey, { expiresIn: '6h' });

    let profileImageUrl;
    if (req.file) {
      profileImageUrl = `http://52.66.238.70/E-Seva/uploads/${req.file.originalname}`;
    }

    const vendorData = { ...body, resetPasswordToken };
    if (profileImageUrl) {
      vendorData.profile_image = profileImageUrl;
    }

    const createdVendor = await vendorModel.create(vendorData);

    const emailSubject = "Set Your Password";
    const emailText = `To set your password, use the following URL: http://localhost:3000/set-password?token=${resetPasswordToken}`;
    const emailHtml = `<p>To set your password, click <a href="http://localhost:3000/set-password?token=${resetPasswordToken}">here</a>.</p>`;

    await mailService(body.email_id, emailSubject, emailText, emailHtml);

    return res.send({
      msg: "Vendor created successfully",
      results: createdVendor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});
