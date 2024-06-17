import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
import db from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const { Feedback, Activity, Roles } = db;

export const getFeedbackList = catchAsync(async (req, res, next) => {
  try {
    // Check if the user has an admin role
    const userRole = await Roles.findByPk(req.user.role_id);
    if (!userRole || userRole.name !== "Admin") {
      return next(new ApiError(httpStatus.FORBIDDEN, "Access denied"));
    }

    const { qFilter, page = 1, pageSize = 10, search } = req.query;

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
          [Op.or]: [
            { subject: { [Op.like]: `%${searchTerm}%` } },
            { feedback_for: { [Op.like]: `%${searchTerm}%` } },
          ],
        };
      }
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    const { rows: feedbacks, count: totalCount } =
      await Feedback.findAndCountAll({
        where: filter,
        offset,
        limit,
        order: [["created_at", "DESC"]],
      });

    const totalPages = Math.ceil(totalCount / limit);

    return res.send({
      message: "Fetched feedbacks successfully",
      data: feedbacks,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNumber,
        pageSize: limit,
      },
    });
  } catch (error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

export const create = catchAsync(async (req, res, next) => {
  const { body } = req;
  const userRole = await Roles.findByPk(req.user.role_id);

  try {
    const feedback = await Feedback.create({
      ...body,
      created_by: req.user.id,
      user_name: req.user.full_name,
      mobile_no: req.user.contact_number,
      user_email: req.user.email,
    });

    const activityData = {
      activity_title: "Feedback Created",
      activity_description: `Feedback with subject ${feedback.feedback_for} created by user ${req.user.id}`,
      activity_created_by_id: req.user.id,
      activity_created_by_type: userRole.name,
      activity_created_at: new Date(),
    };

    await Activity.create(activityData);

    return res.status(httpStatus.CREATED).send({
      message: "Feedback created successfully",
      feedback,
    });
  } catch (error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});
