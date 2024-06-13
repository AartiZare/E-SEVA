import { Op, QueryTypes  } from 'sequelize';
const Sequelize = require('sequelize');
import { catchAsync } from '../utils/catchAsync';
import db from '../models'; // Ensure that your models are correctly imported
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
const feedbackModel = db.Feedback;
const activityModel = db.Activity;
const roleModel = db.Roles;

export const getFeedbackList = catchAsync(async (req, res, next) => {
    try {
        // Check if the user has an admin role
        const userRole = await roleModel.findByPk(req.user.roleId);
        if (!userRole || userRole.name !== 'Admin') {
            return next(new ApiError(httpStatus.FORBIDDEN, 'Access denied'));
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
            if (searchTerm !== '') {
                filter = {
                    ...filter,
                    [Op.or]: [
                        { subject: { [Op.like]: `%${searchTerm}%` } },
                        { feedback_for: { [Op.like]: `%${searchTerm}%` } }
                    ]
                };
            }
        }

        const pageNumber = parseInt(page, 10) || 1;
        const limit = parseInt(pageSize, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        const { rows: feedbacks, count: totalCount } = await feedbackModel.findAndCountAll({
            where: filter,
            offset,
            limit,
            order: [['createdAt', 'DESC']]
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
            }
        });
    } catch (error) {
        return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
});

export const create = catchAsync(async (req, res, next) => {
    const { body } = req;
    const userRole = await roleModel.findByPk(req.user.roleId);
    
    try {
        const feedback = await feedbackModel.create({
            ...body,
            created_by: req.user.id,
            user_name: req.user.full_name,
            mobile_no: req.user.contact_no,
            user_email: req.user.email_id
        });

        const activityData = {
            Activity_title: 'Feedback Created',
            activity_description: `Feedback with subject ${feedback.feedback_for} created by user ${req.user.id}`,
            activity_created_by_id: req.user.id,
            activity_created_by_type: userRole.name,
            activity_created_at: new Date(),
        };
        
        await activityModel.create(activityData);

        return res.status(httpStatus.CREATED).send({
            message: "Feedback created successfully",
            feedback
        });
    } catch (error) {
        return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
    }
});

