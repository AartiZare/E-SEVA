import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
import db from "../models/index.js";
const roleModel = db.Roles;
const activityModel = db.Activity;

export const userActivityList = catchAsync(async (req, res, next) => {
  try {
    const { qFilter, page, pageSize, search } = req.query;
    const user = req.user;
    const userRole = await roleModel.findByPk(user.role_id);

    let filter = {
      activity_created_by_id: user.id,
      activity_created_by_type: userRole.name,
    };

    // Merge qFilter into the filter object if qFilter is provided
    if (qFilter) {
      const parsedQFilter = JSON.parse(qFilter);
      filter = {
        ...filter,
        ...parsedQFilter,
      };
    }

    // Add search term to the filter if provided
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm !== "") {
        filter.activity_name = {
          [Op.like]: `%${searchTerm}%`,
        };
      }
    }

    const pageNumber = parseInt(page) || 1;
    const limit = parseInt(pageSize) || 10;
    const offset = (pageNumber - 1) * limit;

    const { rows: activities, count: totalCount } =
      await activityModel.findAndCountAll({
        where: filter,
        order: [["activity_created_at", "DESC"]],
        limit,
        offset,
      });

    if (!activities.length) {
      return res
        .status(200)
        .send({ status: true, message: "No activities found for the user" });
    }

    // Prepare response object with paginated results
    const response = {
      message: "Fetched activities successfully",
      data: activities.map((activity) => ({
        id: activity.id,
        activity_title: activity.activity_title,
        activity_description: activity.activity_description,
        activity_created_at: activity.activity_created_at,
        activity_created_by_id: activity.activity_created_by_id,
        activity_created_by_type: activity.activity_created_by_type,
        activity_document_id: activity.activity_document_id,
      })),
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: pageNumber,
        pageSize: limit,
      },
    };

    return res.send(response);
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});
