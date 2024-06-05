import dotenv from 'dotenv';
dotenv.config();
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import db from '../models/index.js';
import { parseISO, startOfMonth, endOfDay } from 'date-fns';

const documentModel = db.Document;
const userModel = db.Users;
const activityModel = db.Activity;

// Middleware to check if the user is a supervisor
export const isSupervisor = (req, res, next) => {
    if (req.user.dataValues.roleId === parseInt(process.env.SUPERVISOR)) {
        next();
    } else {
        res.status(403).json({ error: 'User is not a supervisor' });
    }
};

// Function to fetch evaluation data for all users (no filters)
export const fetchAllUsersEvaluation = catchAsync(async (req, res) => {

    try {
        const approvedDocuments = await documentModel.findAll({
            where: {
                approved_by_supervisor: true
            }
        });

        const rejectedDocuments = await documentModel.findAll({
            where: {
                rejected_by_supervisor: true
            }
        });

        const pendingDocuments = await documentModel.findAll({
            where: {
                approved_by_supervisor: false,
                rejected_by_supervisor: false
            }
        });

        const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

        return res.send({
            approved: approvedDocuments.length,
            rejected: rejectedDocuments.length,
            pending: pendingDocuments.length,
            totalApprovedPages,
            totalRejectedPages,
            totalPendingPages
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});

// Function to fetch evaluation data with filters (branch, userId, date)
export const fetchFilteredEvaluation = catchAsync(async (req, res) => {
    try {
        const { userId, fromDate, toDate, branch } = req.query;

        console.log("req.request", req.query)

        const parsedFromDate = parseISO(fromDate);
        const startDate = new Date(parsedFromDate);
        startDate.setHours(0, 0, 0, 0);

        const parsedToDate = parseISO(toDate);
        const endDate = new Date(parsedToDate);
        endDate.setHours(23, 59, 59, 999);

        const filters = {};

        if (userId) {
            filters.created_by = userId;
        }

        if (fromDate && toDate) {
            filters.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        }

        if (branch) {
            filters.branch = branch;
        }

        const approvedDocuments = await documentModel.findAll({
            where: {
                ...filters,
                approved_by_supervisor: true
            }
        });

        const rejectedDocuments = await documentModel.findAll({
            where: {
                ...filters,
                rejected_by_supervisor: true
            }
        });

        const pendingDocuments = await documentModel.findAll({
            where: {
                ...filters,
                approved_by_supervisor: false,
                rejected_by_supervisor: false
            }
        });

        const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

        return res.send({
            approved: approvedDocuments.length,
            rejected: rejectedDocuments.length,
            pending: pendingDocuments.length,
            totalApprovedPages,
            totalRejectedPages,
            totalPendingPages
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});

// Function to fetch daily wise page document/page
export const fetchDailyWisePageDoc = catchAsync(async (req, res) => {
    try {
        const { date } = req.query;

        console.log("req.query", req.query);

        const parsedDate = parseISO(date);

        const startDate = new Date(parsedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(parsedDate);
        endDate.setHours(23, 59, 59, 999);

        const filters = {
            createdAt: {
                [Op.between]: [startDate, endDate]
            },
            approved_by_supervisor: true
        };

        const approvedDocuments = await documentModel.findAll({
            where: {
                ...filters,
                approved_by_supervisor: true
            }
        });

        const rejectedDocuments = await documentModel.findAll({
            where: {
                ...filters,
                rejected_by_supervisor: true
            }
        });

        const pendingDocuments = await documentModel.findAll({
            where: {
                ...filters,
                approved_by_supervisor: false,
                rejected_by_supervisor: false
            }
        });

        const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

        return res.send({
            approved: approvedDocuments.length,
            rejected: rejectedDocuments.length,
            pending: pendingDocuments.length,
            totalApprovedPages,
            totalRejectedPages,
            totalPendingPages
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});

// Function to fetch team data
export const fetchTeamData = catchAsync(async (req, res) => {
    try {
        const { date } = req.query;
        const supervisorId = req.user.id; // Assuming the supervisor's ID is stored in req.user.id

        const parsedDate = parseISO(date);

        const startDate = startOfMonth(parsedDate);
        const endDate = endOfDay(parsedDate);

        const activities = await activityModel.findAll({
            where: {
                activity_created_by_id: supervisorId,
                activity_created_at: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [[db.sequelize.fn('DATE', db.sequelize.col('activity_created_at')), 'activity_date']],
            group: ['activity_date']
        });

        const activityDates = activities.map(a => a.getDataValue('activity_date'));

        const allDatesInMonth = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            allDatesInMonth.push(new Date(d));
        }

        const activeDays = activityDates;
        const inactiveDays = allDatesInMonth.filter(date => !activityDates.includes(date.toISOString().split('T')[0]));

        return res.send({
            activeDays,
            inactiveDays
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});

// Function to get user's activity dates
export const getSupvervisorActivity = catchAsync(async (req, res) => {
    try {
        const { date } = req.query;
        const supervisorId = req.user.id; // Assuming the supervisor's ID is stored in req.user.id

        console.log("supervisorId", req.user);

        const monthDay = new Date(date);
        monthDay.setUTCHours(0, 0, 0, 0);

        const startDate = new Date(monthDay.getFullYear(), monthDay.getMonth(), 1);
        startDate.setUTCHours(0, 0, 0, 0);

        console.log('monthDay', monthDay);  
        console.log("startDate", startDate);

        const activities = await activityModel.findAll({
            where: {
                activity_created_by_id: supervisorId,
                activity_created_at: {
                    [Op.between]: [startDate, monthDay]
                }
            },
            attributes: ['activity_created_at']
        });

        console.log('Raw activities:', activities);

        const activityDates = activities.map(a => {
            const activityDate = a.activity_created_at;
            console.log('activity_created_at:', activityDate);
            return activityDate.toISOString().split('T')[0];
        });

        const allDatesInMonth = [];
        for (let d = new Date(startDate); d <= monthDay; d.setDate(d.getDate() + 1)) {
            allDatesInMonth.push(new Date(d).toISOString().split('T')[0]);
        }

        const activeDays = activityDates;
        const inactiveDays = allDatesInMonth.filter(date => !activeDays.includes(date));

        return res.send({
            activeDays,
            inactiveDays
        });

    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});
