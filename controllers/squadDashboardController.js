import dotenv from "dotenv";
dotenv.config();
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
import db from "../models/index.js";
import { parseISO, startOfDay, endOfDay } from "date-fns";

const documentModel = db.Document;
const userModel = db.User;
const activityModel = db.Activity;
const verificationStatus = { p: 0, a: 1, r: 2 };

// Middleware to check if the user is part of the squad
export const isSquad = (req, res, next) => {
  if (req.user.dataValues.roleId === parseInt(process.env.SQUAD)) {
    next();
  } else {
    res.status(403).json({ error: "User is not part of the squad" });
  }
};

const addVerificationFilter = (filters, vs) => {
  return { ...filters, supervisor_verification_status: verificationStatus[vs] };
};

// Function to fetch total evaluation data
// export const fetchTotalEvaluation = catchAsync(async (req, res) => {
//     try {
//         const { supervisorId, date } = req.query;
//         const squadId = req.user.dataValues.id;

//         console.log("req.user.dataValues.id", req.user.dataValues.id);

//         let supervisorIds = [];
//         let userIds = [];

//         if (supervisorId) {
//             // If a specific supervisorId is provided, use it directly
//             supervisorIds = [parseInt(supervisorId)];
//         } else {
//             // Get all supervisors created by the squad member
//             const supervisors = await userModel.findAll({
//                 where: { created_by: squadId },
//                 attributes: ['id']
//             });

//             if (supervisors.length === 0) {
//                 return res.status(404).send({ error: 'No supervisors found for the given squad ID' });
//             }

//             supervisorIds = supervisors.map(supervisor => supervisor.id);
//         }

//         console.log('supervisorIds', supervisorIds)

//         // Get all user IDs created by the supervisors
//         const users = await userModel.findAll({
//             where: { created_by: { [Op.in]: supervisorIds } },
//             attributes: ['id']
//         });

//         userIds = users.map(user => user.id);

//         if (userIds.length === 0) {
//             return res.status(404).send({ error: 'No users found under this squad/supervisor' });
//         }

//         let filters = {
//             created_by: {
//                 [Op.in]: userIds
//             }
//         };

//         console.log('userIds', userIds);

//         if (date) {
//             const monthDay = new Date(date);
//             monthDay.setUTCHours(0, 0, 0, 0);

//             const startDate = new Date(monthDay);
//             startDate.setUTCHours(0, 0, 0, 0);

//             const endDate = new Date(monthDay);
//             endDate.setUTCHours(23, 59, 59, 999);

//             filters.created_at = {
//                 [Op.between]: [startDate, endDate]
//             };
//         }

//         const approvedDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 approved_by_squad: true
//             }
//         });

//         const rejectedDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 rejected_by_squad: true
//             }
//         });

//         const pendingDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 approved_by_squad: false,
//                 rejected_by_squad: false
//             }
//         });

//         const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
//         const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
//         const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

//         return res.send({
//            evalutionData: {approved: approvedDocuments.length,
//             rejected: rejectedDocuments.length,
//             pending: pendingDocuments.length,
//             totalApprovedPages,
//             totalRejectedPages,
//             totalPendingPages}
//         });
//     } catch (error) {
//         console.error(error.toString());
//         return res.status(500).send({ error: error.message });
//     }
// });

// Function to fetch total evaluation data
// export const fetchDailyWisePageDoc = catchAsync(async (req, res) => {
//     try {
//         const squadId = req.user.dataValues.id;

//         console.log('req.user.dataValues.id', req.user.dataValues.id);

//         // Get all supervisors created by the squad member
//         const supervisors = await userModel.findAll({
//             where: { created_by: squadId },
//             attributes: ['id']
//         });

//         if (supervisors.length === 0) {
//             return res.status(404).send({ error: 'No supervisors found for the given squad ID' });
//         }
//         console.log('supervisors', supervisors);
//         const supervisorIds = supervisors.map(supervisor => supervisor.id);
//         console.log('supervisorIds', supervisorIds)

//         // Get all user IDs created by the supervisors
//         const users = await userModel.findAll({
//             where: { created_by: { [Op.in]: supervisorIds } },
//             attributes: ['id']
//         });

//         const userIds = users.map(user => user.id);

//         console.log('userIds', userIds);
//         if (userIds.length === 0) {
//             return res.status(404).send({ error: 'No users found under this squad/supervisor' });
//         }

//         const currentDate = new Date();
//         currentDate.setUTCHours(0, 0, 0, 0);

//         const startDate = new Date(currentDate);
//         const endDate = new Date(currentDate);
//         endDate.setUTCHours(23, 59, 59, 999);

//         const filters = {
//             created_at: {
//                 [Op.between]: [startDate, endDate]
//             },
//             created_by: {
//                 [Op.in]: userIds
//             }
//         };

//         const approvedDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 approved_by_squad: true
//             }
//         });

//         const rejectedDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 rejected_by_squad: true
//             }
//         });

//         const pendingDocuments = await documentModel.findAll({
//             where: {
//                 ...filters,
//                 approved_by_squad: false,
//                 rejected_by_squad: false
//             }
//         });

//         const totalApprovedPages = approvedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
//         const totalRejectedPages = rejectedDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);
//         const totalPendingPages = pendingDocuments.reduce((total, doc) => total + doc.total_no_of_page, 0);

//         return res.send({
//             dailySquadData: {
//                 approved: approvedDocuments.length,
//                 rejected: rejectedDocuments.length,
//                 pending: pendingDocuments.length,
//                 totalApprovedPages,
//                 totalRejectedPages,
//                 totalPendingPages
//             }
//         });
//     } catch (error) {
//         console.error(error.toString());
//         return res.status(500).send({ error: error.message });
//     }
// });

// Function to fetch team data
// export const fetchTeamData = catchAsync(async (req, res) => {
//     try {
//         const squadId = req.user.dataValues.id;
//         const currentDate = new Date();
//         currentDate.setUTCHours(0, 0, 0, 0);

//         // Get all supervisors created by the squad member
//         const supervisors = await userModel.findAll({
//             where: { created_by: squadId },
//             attributes: ['id', 'full_name']
//         });

//         if (supervisors.length === 0) {
//             return res.status(404).send({ error: 'No supervisors found for the given squad ID' });
//         }

//         const supervisorIds = supervisors.map(supervisor => supervisor.id);

//         // Check activity status for each supervisor
//         const activities = await activityModel.findAll({
//             where: {
//                 activity_created_by_id: { [Op.in]: supervisorIds },
//                 activity_created_at: {
//                     [Op.between]: [currentDate, new Date(currentDate.getTime() + 86399999)] // Current date range
//                 }
//             }
//         });

//         const activeSupervisorIds = activities.map(activity => activity.activity_created_by_id);
//         const totalSupervisors = supervisors.length;
//         const activeSupervisors = activeSupervisorIds.length;
//         const inactiveSupervisors = totalSupervisors - activeSupervisors;

//         return res.send({
//             squadTeamActivity: {total: totalSupervisors,
//             active: activeSupervisors,
//             inactive: inactiveSupervisors}
//         });
//     } catch (error) {
//         console.error(error.toString());
//         return res.status(500).send({ error: error.message });
//     }
// });

// Function to fetch monthly activity data
// export const fetchMonthlyActivity = catchAsync(async (req, res) => {
//     try {
//         const squadId = req.user.dataValues.id;

//         const currentDate = new Date();
//         const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//         firstDayOfMonth.setUTCHours(0, 0, 0, 0);

//         const startDate = firstDayOfMonth;
//         const endDate = new Date(currentDate);
//         endDate.setUTCHours(23, 59, 59, 999);

//         // Fetch all activities for the squad from the 1st of the month till the current day
//         const activities = await activityModel.findAll({
//             where: {
//                 activity_created_by_id: squadId,
//                 activity_created_at: {
//                     [Op.between]: [startDate, endDate]
//                 }
//             },
//             attributes: ['activity_created_at']
//         });

//         const activeDates = activities.map(activity => activity.activity_created_at.toISOString().split('T')[0]);

//         // Create a set of active dates for easy lookup
//         const activeDatesSet = new Set(activeDates);

//         // Generate all dates from the 1st of the month to the current date
//         const allDates = [];
//         for (let d = new Date(firstDayOfMonth); d <= currentDate; d.setDate(d.getDate() + 1)) {
//             allDates.push(new Date(d).toISOString().split('T')[0]);
//         }

//         const inactiveDates = allDates.filter(date => !activeDatesSet.has(date));

//         return res.send({
//             squadActiveDays: {activeDates,
//             inactiveDates}
//         });
//     } catch (error) {
//         console.error(error.toString());
//         return res.status(500).send({ error: error.message });
//     }
// });

export const fetchTotalEvaluation = async (req) => {
  try {
    const { supervisorId, date } = req.query;
    const squadId = req.user.dataValues.id;

    let supervisorIds = [];
    let userIds = [];

    if (supervisorId) {
      supervisorIds = [parseInt(supervisorId)];
    } else {
      const supervisors = await userModel.findAll({
        where: { created_by: squadId },
        attributes: ["id"],
      });

      if (supervisors.length === 0) {
        return { error: "No supervisors found for the given squad ID" };
      }

      supervisorIds = supervisors.map((supervisor) => supervisor.id);
    }

    const users = await userModel.findAll({
      where: { created_by: { [Op.in]: supervisorIds } },
      attributes: ["id"],
    });

    userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      return { error: "No users found under this squad/supervisor" };
    }

    let filters = {
      created_by: {
        [Op.in]: userIds,
      },
    };

    if (date) {
      const monthDay = new Date(date);
      monthDay.setUTCHours(0, 0, 0, 0);

      const startDate = new Date(monthDay);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(monthDay);
      endDate.setUTCHours(23, 59, 59, 999);

      filters.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }

    const approvedDocuments = await documentModel.findAll({
      where: addVerificationFilter(filters, "a"),
    });

    const rejectedDocuments = await documentModel.findAll({
      where: addVerificationFilter(filters, "r"),
    });

    const pendingDocuments = await documentModel.findAll({
      where: addVerificationFilter(filters, "p"),
    });

    const totalApprovedPages = approvedDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page,
      0
    );
    const totalRejectedPages = rejectedDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page,
      0
    );
    const totalPendingPages = pendingDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page,
      0
    );

    return {
      evalutionData: {
        approved: approvedDocuments.length,
        rejected: rejectedDocuments.length,
        pending: pendingDocuments.length,
        totalApprovedPages,
        totalRejectedPages,
        totalPendingPages,
      },
    };
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

export const fetchDailyWisePageDoc = async (req) => {
  try {
    const squadId = req.user.dataValues.id;

    const supervisors = await userModel.findAll({
      where: { created_by: squadId },
      attributes: ["id"],
    });

    if (supervisors.length === 0) {
      return { error: "No supervisors found for the given squad ID" };
    }

    const supervisorIds = supervisors.map((supervisor) => supervisor.id);

    const users = await userModel.findAll({
      where: { created_by: { [Op.in]: supervisorIds } },
      attributes: ["id"],
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      return { error: "No users found under this squad/supervisor" };
    }

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const filters = {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
      created_by: {
        [Op.in]: userIds,
      },
    };

    const approvedDocuments = await documentModel.findAll({
      where: addVerificationFilter(filters, "a"),
    });

    const rejectedDocuments = await documentModel.findAll({
      where: addVerificationFilter(filters, "r"),
    });

    const pendingDocuments = await documentModel.findAll({
      where: addVerificationFilter(filters, "p"),
    });

    const totalApprovedPages = approvedDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page,
      0
    );
    const totalRejectedPages = rejectedDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page,
      0
    );
    const totalPendingPages = pendingDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page,
      0
    );

    return {
      dailySquadData: {
        approved: approvedDocuments.length,
        rejected: rejectedDocuments.length,
        pending: pendingDocuments.length,
        totalApprovedPages,
        totalRejectedPages,
        totalPendingPages,
      },
    };
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

export const fetchTeamData = async (req) => {
  try {
    const squadId = req.user.dataValues.id;
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const supervisors = await userModel.findAll({
      where: { created_by: squadId },
      attributes: ["id", "full_name"],
    });

    if (supervisors.length === 0) {
      return { error: "No supervisors found for the given squad ID" };
    }

    const supervisorIds = supervisors.map((supervisor) => supervisor.id);

    const activities = await activityModel.findAll({
      where: {
        activity_created_by_id: { [Op.in]: supervisorIds },
        activity_created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const activeSupervisorIdsSet = new Set(
      activities.map((activity) => activity.activity_created_by_id)
    );
    const activeSupervisorIds = Array.from(activeSupervisorIdsSet);
    const totalSupervisors = supervisors.length;
    const activeSupervisors = activeSupervisorIds.length;
    const inactiveSupervisors = totalSupervisors - activeSupervisors;

    return {
      squadTeamActivity: {
        total: totalSupervisors,
        active: activeSupervisors,
        inactive: inactiveSupervisors,
      },
    };
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

export const fetchMonthlyActivity = async (req) => {
  try {
    const squadId = req.user.dataValues.id;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    firstDayOfMonth.setUTCHours(0, 0, 0, 0);

    const startDate = firstDayOfMonth;
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const activities = await activityModel.findAll({
      where: {
        activity_created_by_id: squadId,
        activity_created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["activity_created_at"],
    });

    //const activeDates = activities.map(activity => activity.activity_created_at.toISOString().split('T')[0]);

    const activeDates = [
      ...new Set(
        activities.map(
          (activity) => activity.activity_created_at.toISOString().split("T")[0]
        )
      ),
    ];

    const activeDatesSet = new Set(activeDates);

    const allDates = [];
    for (
      let d = new Date(firstDayOfMonth);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      allDates.push(new Date(d).toISOString().split("T")[0]);
    }

    const inactiveDates = allDates.filter((date) => !activeDatesSet.has(date));

    return {
      squadActiveDays: {
        activeDates,
        inactiveDates,
      },
    };
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

export const fetchSupervisorsForSquad = async (req) => {
  try {
    const squadId = req.user.dataValues.id;

    // Fetch supervisors created by the squad member
    const supervisors = await userModel.findAll({
      where: { created_by: squadId },
      attributes: ["id", "full_name", "email"],
    });

    if (supervisors.length === 0) {
      return res
        .status(404)
        .send({ error: "No supervisors found for this squad" });
    }

    return { supervisors };
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: error.message });
  }
};

export const fetchAllData = catchAsync(async (req, res) => {
  try {
    const squadId = req.user.dataValues.id;

    // Fetch total evaluation
    const totalEvaluationPromise = fetchTotalEvaluation(req);

    // Fetch daily wise doc/page data
    const dailyWisePageDocPromise = fetchDailyWisePageDoc(req);

    // Fetch team data
    const teamDataPromise = fetchTeamData(req);

    // Fetch monthly activity data
    const monthlyActivityPromise = fetchMonthlyActivity(req);

    const fetchSupervisorsPromise = fetchSupervisorsForSquad(req);

    // Wait for all promises to resolve
    const [
      totalEvaluation,
      dailyWisePageDoc,
      teamData,
      monthlyActivity,
      fetchSupervisors,
    ] = await Promise.all([
      totalEvaluationPromise,
      dailyWisePageDocPromise,
      teamDataPromise,
      monthlyActivityPromise,
      fetchSupervisorsPromise,
    ]);

    return res.send({
      squadTotalEvaluation: totalEvaluation.evalutionData,
      squadDailyWisePageDoc: dailyWisePageDoc.dailySquadData,
      squadTeamData: teamData.squadTeamActivity,
      squadmonthlyActivity: monthlyActivity.squadActiveDays,
      supervisors: fetchSupervisors.supervisors,
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: error.message });
  }
});
