import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const roleModel = db.Roles;
const activityModel = db.Activity;

export const userActivityList = catchAsync(async (req, res, next) => {
    try {
        const { page, pageSize, search } = req.query;
        const user = req.user;
        const userRole = await roleModel.findByPk(user.roleId);
        let filter = {
            activity_created_by_id: user.id,
            activity_created_by_type: userRole.name
        };

        if (search) {
            const searchTerm = search.trim();
            if (searchTerm !== '') {
                filter.activity_name = {
                    [Op.like]: `%${searchTerm}%`
                };
            }
        }

        let pageNumber = parseInt(page) || 1;
        let size = parseInt(pageSize) || 10;

        const query = {
            where: filter,
            order: [['activity_created_at', 'DESC']],
            limit: size,
            offset: (pageNumber - 1) * size,
        };

        const userActivity = await activityModel.findAll(query);

        if (!userActivity.length) {
            // Return success response with appropriate message when no activities found
            return res.status(200).send({ status: true, message: 'No activities found for the user' });
        }

        return res.send({ status: true, data: userActivity });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});
