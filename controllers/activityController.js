import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const roleModel = db.Roles;
const activityModel = db.Activity;


export const userActivityList = catchAsync(async (req, res, next) => {
    try {
        const user = req.user;
        const userRole = await roleModel.findByPk(user.roleId);
        const userActivity = await activityModel.findAll({
            where: {
                activity_created_by_id: user.id,
                activity_created_by_type: userRole.name
            }
        });

        if (!userActivity.length) {
            return res.status(404).send({ status: false, message: 'No activities found for the user' });
        }

        return res.send({ status: true, data: userActivity });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});
