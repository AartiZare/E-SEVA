import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
// import httpStatus from "http-status";
// import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
// import {
//   format,
//   parseISO,
//   startOfMonth,
//   endOfDay,
//   lastDayOfMonth,
// } from "date-fns";

const documentModel = db.Document;
const activityModel = db.Activity;
const userStateToBranchModel = db.UserStateToBranch;
const roleModel = db.Role;

const fetchUserRecords = async (req) => {
  const userId = req.user.id;
  const { fromDate, toDate, branch_id } = req.query;

  let filters = {};

  if (fromDate && toDate) {
    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    filters.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  //     if (branch_id) {
  //         filters.branch_id = branch_id;
  //   }

  const _userBranches = await userStateToBranchModel.findAll({
    where: {
      user_id: userId,
      status: true,
    },
    attributes: ["branch_id"],
  });

  filters.branch_id = _userBranches.map((branch) => branch.branch_id);

  const approvedDocuments = await documentModel.findAll({
    where: {
      ...filters,
      final_verification_status: 1,
    },
  });

  const rejectedDocuments = await documentModel.findAll({
    where: {
      ...filters,
      final_verification_status: 2,
    },
  });

  const pendingDocuments = await documentModel.findAll({
    where: {
      ...filters,
      final_verification_status: 0,
    },
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
    approved: approvedDocuments.length,
    rejected: rejectedDocuments.length,
    pending: pendingDocuments.length,
    totalApprovedPages,
    totalRejectedPages,
    totalPendingPages,
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

  const userRole = await roleModel.findByPk(req.user.role_id); // Fetch user role
  if (userRole.name === "User") {
    const filters = {
      created_by: userId,
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };

    const _userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
        status: true,
      },
      attributes: ["branch_id"],
    });

    filters.branch_id = _userBranches.map((branch) => branch.branch_id);

    const approvedCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 1,
      },
    });

    const rejectedCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 2,
      },
    });

    const pendingCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 0,
      },
    });

    return {
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
    };
  } else if (userRole.name === "Squad") {
    const filters = {
      activity_created_by_id: userId,
      activity_created_at: {
        [Op.between]: [startDate, endDate],
      },
      activity_title: "Document Approved",
    };

    const approvedCount = await activityModel.count({
      where: filters,
    });

    filters.activity_title = "Document Rejected";
    const rejectedCount = await activityModel.count({
      where: filters,
    });

    const _userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
        status: true,
      },
      attributes: ["branch_id"],
    });

    const branch_id = _userBranches.map((branch) => branch.branch_id);

    const pendingCount = await documentModel.count({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
        supervisor_verification_status: 1,
        squad_verification_status: 0,
        branch_id,
      },
    });

    return {
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
    };
  } else {
    const filters = {
      activity_created_by_id: userId,
      activity_created_at: {
        [Op.between]: [startDate, endDate],
      },
      activity_title: "Document Approved",
    };

    const approvedCount = await activityModel.count({
      where: filters,
    });

    filters.activity_title = "Document Rejected";
    const rejectedCount = await activityModel.count({
      where: filters,
    });

    const _userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
        status: true,
      },
      attributes: ["branch_id"],
    });

    const branch_id = _userBranches.map((branch) => branch.branch_id);

    const pendingCount = await documentModel.count({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
        supervisor_verification_status: 0,
        branch_id,
      },
    });

    return {
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
    };
  }
};

// Function to fetch user's monthly activity
const fetchUserMonthlyActivity = async (req) => {
  const userId = req.user.dataValues.id;

  const currentDate = new Date();
  currentDate.setUTCHours(23, 59, 59, 999); // Set current date to end of the day

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  firstDayOfMonth.setUTCHours(0, 0, 0, 0); // Set first day of the month to start of the day

  const startDate = firstDayOfMonth;
  const endDate = new Date(currentDate);
  endDate.setUTCHours(23, 59, 59, 999);

  const activities = await activityModel.findAll({
    where: {
      activity_created_by_id: userId,
      activity_created_at: { [Op.between]: [startDate, endDate] },
    },
    attributes: ["activity_created_at"],
  });

  const activeDates = [
    ...new Set(
      activities.map(
        (activity) => activity.activity_created_at.toISOString().split("T")[0]
      )
    ),
  ];

  const allDates = [];
  for (
    let d = new Date(firstDayOfMonth);
    d <= currentDate;
    d.setDate(d.getDate() + 1)
  ) {
    allDates.push(new Date(d).toISOString().split("T")[0]);
  }

  const inactiveDates = allDates.filter((date) => !activeDates.includes(date));

  return { activeDates, inactiveDates };
};

// Combined data API for user
export const fetchAllUserData = catchAsync(async (req, res) => {
  try {
    const userRecordsPromise = fetchUserRecords(req);
    const userDailyActivityPromise = fetchUserDailyActivity(req);
    const userMonthlyActivityPromise = fetchUserMonthlyActivity(req);

    const [userRecords, userDailyActivity, userMonthlyActivity] =
      await Promise.all([
        userRecordsPromise,
        userDailyActivityPromise,
        userMonthlyActivityPromise,
      ]);

    return res.send({
      userRecords,
      userDailyActivity,
      userMonthlyActivity,
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: error.message });
  }
});
