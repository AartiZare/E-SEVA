import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
import { parseISO } from 'date-fns';

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

        console.log("allDocuments", allDocuments.length);

        console.log("approvedCount", approvedCount);
        console.log("rejectedCount", rejectedCount);
        console.log("pendingCount", pendingCount);

        console.log("filters", filters);

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
        const { userId, year, month } = req.query;

        console.log("req.query", req.query);

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        console.log("startDate", startDate);
        console.log("endDate", endDate);

        const activities = await db.sequelize.query(
            `SELECT DISTINCT DATE(activity_created_at) as activity_date 
             FROM activities 
             WHERE activity_created_by_id = :userId 
             AND activity_created_at BETWEEN :startDate AND :endDate`,
            {
                replacements: { userId, startDate, endDate },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        const activeDays = activities.map(a => a.activity_date);
        return res.send({
            activeDays
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});
