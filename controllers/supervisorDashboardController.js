import dotenv from "dotenv";
dotenv.config();
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
import db from "../models/index.js";
import { parseISO, startOfMonth, endOfDay } from "date-fns";

// TODO: This whole has user Model. change it.

const documentModel = db.Document;
const userModel = db.User;
const activityModel = db.Activity; // Import the role model
const userBranchModel = db.UserBranch;
const branchModel = db.Branch;
const verificationStatus = { p: 0, a: 1, r: 2 };

// Middleware to check if the user is a supervisor
export const isSupervisor = (req, res, next) => {
  if (req.user.dataValues.role_id === parseInt(process.env.SUPERVISOR)) {
    next();
  } else {
    res.status(403).json({ error: "User is not a supervisor" });
  }
};

const addVerificationFilter = (filters, vs) => {
  return { ...filters, supervisor_verification_status: verificationStatus[vs] };
};

// TODO: Ask bapu and modify it by removing userBranch
const fetchTotalEvaluation = async (req) => {
  try {
    const { branch_id, userId, date } = req.query;
    const supervisorId = req.user.dataValues.id;

    const users = await userModel.findAll({
      where: { created_by: supervisorId },
      attributes: ["id"],
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      return {
        evalutionData: {
          approved: 0,
          rejected: 0,
          pending: 0,
          totalApprovedPages: 0,
          totalRejectedPages: 0,
          totalPendingPages: 0,
        },
      };
    }

    let filters = { created_by: { [Op.in]: userIds } };

    if (branch_id) {
      const userBranches = await userBranchModel.findAll({
        where: {
          branchId: parseInt(branch_id),
          userId: { [Op.in]: userIds },
        },
        attributes: ["userId"],
      });
      const branchUserIds = userBranches.map((userBranch) => userBranch.userId);
      filters.created_by = { [Op.in]: branchUserIds };
    }

    if (userId) {
      filters.created_by = userId;
    }

    if (date) {
      const monthDay = new Date(date);
      monthDay.setUTCHours(0, 0, 0, 0);

      const startDate = new Date(monthDay);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(monthDay);
      endDate.setUTCHours(23, 59, 59, 999);

      filters.createdAt = { [Op.between]: [startDate, endDate] };
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
      (total, doc) => total + doc.total_no_of_page * 1,
      0
    );
    const totalRejectedPages = rejectedDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page * 1,
      0
    );
    const totalPendingPages = pendingDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page * 1,
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

// Function to fetch daily wise document/page data
const fetchDailyWisePageDoc = async (req) => {
  try {
    const supervisorId = req.user.dataValues.id;

    const users = await userModel.findAll({
      where: { created_by: supervisorId },
      attributes: ["id"],
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      return {
        dailySupervisorData: {
          approved: 0,
          rejected: 0,
          pending: 0,
          totalApprovedPages: 0,
          totalRejectedPages: 0,
          totalPendingPages: 0,
        },
      };
    }

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const filters = {
      createdAt: { [Op.between]: [startDate, endDate] },
      created_by: { [Op.in]: userIds },
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
      (total, doc) => total + doc.total_no_of_page * 1,
      0
    );
    const totalRejectedPages = rejectedDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page * 1,
      0
    );
    const totalPendingPages = pendingDocuments.reduce(
      (total, doc) => total + doc.total_no_of_page * 1,
      0
    );

    return {
      dailySupervisorData: {
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

// Function to fetch team data
const fetchTeamData = async (req) => {
  try {
    const supervisorId = req.user.dataValues.id;

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const users = await userModel.findAll({
      where: { created_by: supervisorId },
      attributes: ["id"],
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      return { supervisorTeamData: { total: 0, active: 0, inactive: 0 } };
    }

    const activities = await activityModel.findAll({
      where: {
        activity_created_by_id: { [Op.in]: userIds },
        activity_created_at: { [Op.between]: [startDate, endDate] },
      },
    });

    const activeUserIdsSet = new Set(
      activities.map((activity) => activity.activity_created_by_id)
    );
    const activeUserIds = Array.from(activeUserIdsSet);
    const totalUsers = userIds.length;
    const activeUsers = activeUserIds.length;
    const inactiveUsers = totalUsers - activeUsers;

    return {
      supervisorTeamData: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },
    };
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

// Function to fetch monthly activity
const fetchMonthlyActivity = async (req) => {
  try {
    const supervisorId = req.user.dataValues.id;

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
        activity_created_by_id: supervisorId,
        activity_created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["activity_created_at"],
    });
    // const activeDates = activities.map(activity => activity.activity_created_at.toISOString().split('T')[0]);

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
      supervisorActivityDays: {
        activeDates,
        inactiveDates,
      },
    };
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

// Function to fetch branches for the supervisor
const fetchBranchesForSupervisor = async (req, res, next) => {
  try {
    const supervisorId = req.user.dataValues.id;

    // Fetch the branch IDs for the supervisor
    const supervisor = await userModel.findOne({
      where: { id: supervisorId },
      attributes: ["branch_id"],
    });

    if (!supervisor || supervisor.branch.length === 0) {
      return { error: "No branches found for this supervisor" };
    }

    const branchIds = supervisor.branch;

    // Fetch branch names and IDs from branchModel
    const branches = await branchModel.findAll({
      where: {
        id: { [Op.in]: branchIds },
      },
      attributes: ["id", "name"],
    });

    // Map the branches to include both ID and name
    const branchData = branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
    }));

    return { supervisorBranches: branchData };
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

// Function to fetch users for a branch
export const fetchUsersForBranch = async (req, res, next) => {
  try {
    const { branchId } = req.query;
    const supervisorId = req.user.dataValues.id;

    // Fetch users belonging to the branch from userBranchModel
    const userBranches = await userBranchModel.findAll({
      where: {
        branch_id: branchId,
        status: true,
      },
      attributes: ["userId"],
    });

    const userIdsInBranch = userBranches.map((userBranch) => userBranch.userId);

    if (userIdsInBranch.length === 0) {
      return { error: "No users found for this branch" };
    }

    // Fetch users from userModel who belong to the branch and are created by the supervisor
    const users = await userModel.findAll({
      where: {
        id: { [Op.in]: userIdsInBranch },
        created_by: supervisorId,
      },
      attributes: ["id", "full_name", "email"],
    });

    if (users.length === 0) {
      return {
        error: "No users found under this supervisor for the specified branch",
      };
    }

    return res.send({ users });
  } catch (error) {
    console.error(error.toString());
    throw new Error(error.message);
  }
};

// Combined data API for supervisor
export const fetchAllSupervisorData = catchAsync(async (req, res) => {
  try {
    const supervisorId = req.user.dataValues.id;

    // Fetch total evaluation
    const totalEvaluationPromise = fetchTotalEvaluation(req);

    // Fetch daily wise doc/page data
    const dailyWisePageDocPromise = fetchDailyWisePageDoc(req);

    // Fetch team data
    const teamDataPromise = fetchTeamData(req);

    // Fetch monthly activity data
    const monthlyActivityPromise = fetchMonthlyActivity(req);

    // Fetch branches for supervisor
    const fetchBranchesForSupervisorPromise = fetchBranchesForSupervisor(req);

    // Fetch users for branch
    //  const fetchUsersForBranchPromise = fetchUsersForBranch(req);

    // Wait for all promises to resolve
    const [
      totalEvaluation,
      dailyWisePageDoc,
      teamData,
      monthlyActivity,
      supervisorBranches,
    ] = await Promise.all([
      totalEvaluationPromise,
      dailyWisePageDocPromise,
      teamDataPromise,
      monthlyActivityPromise,
      fetchBranchesForSupervisorPromise,
    ]);

    return res.send({
      supervisorTotalEvaluation: totalEvaluation.evalutionData,
      supervisorDailyWisePageDoc: dailyWisePageDoc.dailySupervisorData,
      supervisorTeamData: teamData.supervisorTeamData,
      supervisorMonthlyActivity: monthlyActivity.supervisorActivityDays,
      supervisorBranches: supervisorBranches.supervisorBranches,
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: error.message });
  }
});
