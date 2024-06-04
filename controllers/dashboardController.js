import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
import { format, parseISO, startOfMonth, endOfDay, lastDayOfMonth } from 'date-fns';

const documentModel = db.Document;
const activityModel = db.Activity;
const branchModel = db.Branch;
const userModel = db.Users;

// Function to fetch all records without filters
export const fetchAllUserRecords = catchAsync(async (req, res) => {
    try {
        const { userId } = req.query;

        console.log("req.query", req.query); 

        const approvedDocuments = await documentModel.findAll({
            where: {
                created_by: userId,
                is_document_approved: true
            }
        });

        const rejectedDocuments = await documentModel.findAll({
            where: {
                created_by: userId,
                is_document_rejected: true
            }
        });

        const pendingDocuments = await documentModel.findAll({
            where: {
                created_by: userId,
                is_document_approved: false,
                is_document_rejected: false
            }
        });

        console.log("approvedDocuments", approvedDocuments.length);
        console.log("rejectedDocuments", rejectedDocuments.length);
        console.log("pendingDocuments", pendingDocuments.length);  

        const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

        console.log("totalApprovedPages", totalApprovedPages);
        console.log("totalRejectedPages", totalRejectedPages);
        console.log("totalPendingPages", totalPendingPages);

        return res.send({
            approved: approvedDocuments.length,
            rejected: rejectedDocuments.length,
            pending: pendingDocuments.length,
            totalApprovedPages,
            totalRejectedPages,
            totalPendingPages,
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});

// Function to fetch records with filters
export const fetchUserRecords = catchAsync(async (req, res) => {
    try {
        const { userId, fromDate, toDate, branch } = req.query;

        console.log("req.query", req.query);   
        console.log("req.query", req);

        const parsedFromDate = parseISO(fromDate);
        const startDate = new Date(parsedFromDate);
        startDate.setHours(0, 0, 0, 0);

        const parsedToDate = parseISO(toDate);
        const endDate = new Date(parsedToDate);
        endDate.setHours(23, 59, 59, 999);


        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).send({ status: false, message: 'User not found' });
        }

        const userBranches = user.branch;

        const filters = {
            created_by: userId
        };

        if(fromDate && toDate) {
            filters.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        }

        if (branch && userBranches.includes(parseInt(branch, 10))) {
            filters.branch = branch;
        }

        const approvedDocuments = await documentModel.findAll({
            where: {
                ...filters,
                is_document_approved: true
            }
        });

        const rejectedDocuments = await documentModel.findAll({
            where: {
                ...filters,
                is_document_rejected: true
            }
        });

        const pendingDocuments = await documentModel.findAll({
            where: {
                ...filters,
                is_document_approved: false,
                is_document_rejected: false
            }
        });

        console.log("approvedDocuments", approvedDocuments.length);
        console.log("pendingDocuments", pendingDocuments.length);
        console.log("filters", filters);

        const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
        const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

        return res.send({
            approved: approvedDocuments.length,
            rejected: rejectedDocuments.length,
            pending: pendingDocuments.length,
            totalApprovedPages,
            totalRejectedPages,
            totalPendingPages,
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});

// Function to get day activity
export const getDayActivity = catchAsync(async (req, res) => {
    try {
        const { userId, date} = req.query;

        console.log("req.query", req.query);

        const parsedDate = parseISO(date);

        const startDate = new Date(parsedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(parsedDate);
        endDate.setHours(23, 59, 59, 999);

        const filters = {
            created_by: userId,
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        };

        const approvedCount = await documentModel.count({
            where: {
                ...filters,
                is_document_approved: true
            }
        });

        const rejectedCount = await documentModel.count({
            where: {
                ...filters,
                is_document_rejected: true
            }
        });

        const pendingCount = await documentModel.count({
            where: {
                ...filters,
                is_document_approved: false,
                is_document_rejected: false
            }
        });

        const allDocuments = await documentModel.findAll({
            where: {
                created_by: userId,
                createdAt: {
                    [Op.eq]: new Date(date).setHours(0, 0, 0, 0)
                }
            }
        });
        console.log("approvedCount", approvedCount);
        console.log("rejectedCount", rejectedCount);
        console.log("pendingCount", pendingCount);

        return res.send({
            approved: approvedCount,
            rejected: rejectedCount,
            pending: pendingCount
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});

// Function to get user activity for a month
export const getUserMonthlyActivity = catchAsync(async (req, res) => {
    try {
        const { userId, date } = req.query;

        console.log("req.query", req.query);

        const monthDay = new Date(date);
        monthDay.setUTCHours(0, 0, 0, 0);

        const startDate = new Date(monthDay.getFullYear(), monthDay.getMonth(), 1);
        startDate.setUTCHours(0, 0, 0, 0);

        console.log('monthDay', monthDay);  
        console.log("startDate", startDate);

        const activities = await activityModel.findAll({
            where: {
                activity_created_by_id: userId,
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
