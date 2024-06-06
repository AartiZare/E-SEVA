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
// export const fetchAllUserRecords = catchAsync(async (req, res) => {
//     try {
//         const userId = req.user.dataValues.id; // Get userId from req.user
//         const { fromDate, toDate, branch} = req.query; // Extract fromDate, toDate, and branch from the query parameters

//         let filters = { created_by: userId };

//         if (fromDate && toDate) {
//             const parsedFromDate = new Date(fromDate);
//             const parsedToDate = new Date(toDate);

//             const startDate = new Date(parsedFromDate);
//             startDate.setUTCHours(0, 0, 0, 0);

//             const endDate = new Date(parsedToDate);
//             endDate.setUTCHours(23, 59, 59, 999);

//             filters.createdAt = {
//                 [Op.between]: [startDate, endDate]
//             };
//         }

//          if (branch) {
//              filters.branch = branch;
//          }

//         const approvedDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 is_document_approved: true
//             }
//         });

//         const rejectedDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 is_document_rejected: true
//             }
//         });

//         const pendingDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 is_document_approved: false,
//                 is_document_rejected: false
//             }
//         });

//         const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
//         const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
//         const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

//         return res.send({
//             userData:{approved: approvedDocuments.length,
//             rejected: rejectedDocuments.length,
//             pending: pendingDocuments.length,
//             totalApprovedPages,
//             totalRejectedPages,
//             totalPendingPages,}
//         });
//     } catch (error) {
//         console.error(error.toString());
//         return res.status(500).send({ error: error.message });
//     }
// });

// Function to get day activity
// export const getDayActivity = catchAsync(async (req, res) => {
//     try {
//         const userId = req.user.dataValues.id; // Get userId from req.user

//         const currentDate = new Date();
//         currentDate.setUTCHours(0, 0, 0, 0);

//         const startDate = new Date(currentDate);
//         const endDate = new Date(currentDate);
//         endDate.setUTCHours(23, 59, 59, 999);

//         const filters = {
//             created_by: userId,
//             createdAt: {
//                 [Op.between]: [startDate, endDate]
//             }
//         };

//         const approvedCount = await documentModel.count({
//             where: {
//                 ...filters,
//                 is_document_approved: true
//             }
//         });

//         const rejectedCount = await documentModel.count({
//             where: {
//                 ...filters,
//                 is_document_rejected: true
//             }
//         });

//         const pendingCount = await documentModel.count({
//             where: {
//                 ...filters,
//                 is_document_approved: false,
//                 is_document_rejected: false
//             }
//         });

//         return res.send({
//             userDayActivity: {approved: approvedCount,
//             rejected: rejectedCount,
//             pending: pendingCount}
//         });
//     } catch (error) {
//         console.error(error.toString());
//         return res.status(500).send({ error: error.message });
//     }
// });

// Function to get user activity for a month
// export const getUserMonthlyActivity = catchAsync(async (req, res) => {
//     try {
//         const userId = req.user.dataValues.id; // Get userId from req.user

//         const currentDate = new Date();
//         currentDate.setUTCHours(23, 59, 59, 999); // Set current date to end of the day

//         const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//         firstDayOfMonth.setUTCHours(0, 0, 0, 0); // Set first day of the month to start of the day

//         const activities = await activityModel.findAll({
//             where: {
//                 activity_created_by_id: userId,
//                 activity_created_at: { [Op.between]: [firstDayOfMonth, currentDate] }
//             },
//             attributes: ['activity_created_at']
//         });

//         const activeDates = [...new Set(activities.map(activity => activity.activity_created_at.toISOString().split('T')[0]))];

//         const allDates = [];
//         for (let d = new Date(firstDayOfMonth); d <= currentDate; d.setDate(d.getDate() + 1)) {
//             allDates.push(new Date(d).toISOString().split('T')[0]);
//         }

//         const inactiveDates = allDates.filter(date => !activeDates.includes(date));

//         return res.send({
//            userMontlyActivity:{activeDates,
//             inactiveDates}
//         });
//     } catch (error) {
//         console.error(error.toString());
//         return res.status(500).send({ error: error.message });
//     }
// });

const fetchUserRecords = async (req) => {
    const userId = req.user.dataValues.id;
    const { fromDate, toDate, branch } = req.query;

    let filters = { created_by: userId };


    if (fromDate && toDate) {
        const startDate = new Date(fromDate);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(toDate);
        endDate.setUTCHours(23, 59, 59, 999);

        filters.createdAt = {
            [Op.between]: [startDate, endDate]
        };
    }

//     if (branch) {
//         filters.branch = branch;
//   }

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

    const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
    const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
    const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

    return {
        approved: approvedDocuments.length,
        rejected: rejectedDocuments.length,
        pending: pendingDocuments.length,
        totalApprovedPages,
        totalRejectedPages,
        totalPendingPages
    };
};

// Function to fetch user's daily activity
const fetchUserDailyActivity = async (req) => {
    const userId = req.user.dataValues.id;

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

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

    return { approved: approvedCount, rejected: rejectedCount, pending: pendingCount };
};

// Function to fetch user's monthly activity
const fetchUserMonthlyActivity = async (req) => {
    const userId = req.user.dataValues.id;

    const currentDate = new Date();
    currentDate.setUTCHours(23, 59, 59, 999); // Set current date to end of the day

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    firstDayOfMonth.setUTCHours(0, 0, 0, 0); // Set first day of the month to start of the day

    const startDate = firstDayOfMonth;
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const activities = await activityModel.findAll({
        where: {
            activity_created_by_id: userId,
            activity_created_at: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['activity_created_at']
    });

    const activeDates = [...new Set(activities.map(activity => activity.activity_created_at.toISOString().split('T')[0]))];

    const allDates = [];
    for (let d = new Date(firstDayOfMonth); d <= currentDate; d.setDate(d.getDate() + 1)) {
        allDates.push(new Date(d).toISOString().split('T')[0]);
    }

    const inactiveDates = allDates.filter(date => !activeDates.includes(date));

    return { activeDates, inactiveDates };
};

// Combined data API for user
export const fetchAllUserData = catchAsync(async (req, res) => {
    try {
        const userRecordsPromise = fetchUserRecords(req);
        const userDailyActivityPromise = fetchUserDailyActivity(req);
        const userMonthlyActivityPromise = fetchUserMonthlyActivity(req);

        const [userRecords, userDailyActivity, userMonthlyActivity] = await Promise.all([
            userRecordsPromise,
            userDailyActivityPromise,
            userMonthlyActivityPromise
        ]);

        return res.send({
            userRecords,
            userDailyActivity,
            userMonthlyActivity
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: error.message });
    }
});