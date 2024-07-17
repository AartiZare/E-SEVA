import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
// import httpStatus from "http-status";
// import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
import { userBranches } from "./documentController.js";
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
const userModel = db.User;

const fetchUserRecords = async (req) => {
  const userId = req.user.id;
  const { fromDate, toDate, branch_id, date, user_id } = req.query;

  let filters = {};

  // Date filter
  if (date) {
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);

    filters.createdAt = {
      [Op.between]: [selectedDate, new Date(selectedDate).setUTCHours(23, 59, 59, 999)],
    };
  } else if (fromDate && toDate) {
    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    filters.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  // Branch filter
  if (branch_id) {
    filters.branch_id = branch_id;
  }

  // User filter
  if (user_id) {
    filters.created_by = user_id;
  }

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
      [Op.or]: [
        { squad_verified_by: userId },
        { supervisor_verified_by: userId },
        { created_by: userId }
      ]
    },
  });

  const rejectedDocuments = await documentModel.findAll({
    where: {
      ...filters,
      final_verification_status: 2,
      [Op.or]: [
        { supervisor_rejected_by: userId },
        { squad_rejected_by: userId },
        { created_by: userId }
      ]
    },
  });

  let pendingDocuments = [];

  if (req.user.role_id === 4) {
    pendingDocuments = await documentModel.findAll({
      where: {
        ...filters,
        final_verification_status: 0,
        created_by: userId,
      },
    });
  } else if (req.user.role_id === 2) {
    const users = await userModel.findAll({
      where: {
        created_by: userId
      }
    });
    const userIdsMap = users.map((user) => user.id);
    pendingDocuments = await documentModel.findAll({
      where: {
        ...filters,
        final_verification_status: 0,
        supervisor_verified_by: null,
        squad_verified_by: null,
        supervisor_verification_status: 0,
        squad_verification_status: 0,
        created_by: userIdsMap
      },
    });
  } else if (req.user.role_id === 3) {
    const createdSupervisors = await userModel.findAll({
      where: {
        created_by: userId
      }
    });

    const superVisorIds = createdSupervisors.map((user) => user.id);
    const users = await userModel.findAll({
      where: {
        created_by: superVisorIds
      }
    });
    const userIdsMap = users.map((user) => user.id);
    pendingDocuments = await documentModel.findAll({
      where: {
        ...filters,
        final_verification_status: 0,
        supervisor_verified_by: { [Op.ne]: null },
        supervisor_verification_status: 1,
        squad_verification_status: 0,
        squad_verified_by: null,
        created_by: userIdsMap
      },
    });
  }


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
  const userId = req.user.id;
  const { fromDate, toDate, branch_id, date, user_id } = req.query;

  let filters = {};

  // Date filter
  if (date) {
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);

    filters.createdAt = {
      [Op.between]: [selectedDate, new Date(selectedDate).setUTCHours(23, 59, 59, 999)],
    };
  } else if (fromDate && toDate) {
    const startDate = new Date(fromDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setUTCHours(23, 59, 59, 999);

    filters.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  } else {
    // Default to today's date
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999);

    filters.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (branch_id) {
    filters.branch_id = branch_id;
  }

  if (user_id) {
    filters.created_by = user_id;
  }

  const _userBranches = await userStateToBranchModel.findAll({
    where: {
      user_id: userId,
      status: true,
    },
    attributes: ["branch_id"],
  });

  filters.branch_id = _userBranches.map((branch) => branch.branch_id);

  const userRole = await roleModel.findByPk(req.user.role_id);

  if (userRole.name === "User") {
    filters.created_by = userId;

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
    const createdSupervisors = await userModel.findAll({
      where: {
        created_by: userId,
      },
    });

    const superVisorIds = createdSupervisors.map((user) => user.id);

    const users = await userModel.findAll({
      where: {
        created_by: superVisorIds,
      },
    });
    const userIdsMap = users.map((user) => user.id);

    const approvedCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 1,
        [Op.or]: [
          { squad_verified_by: userId },
          { supervisor_verified_by: userId },
        ],
      },
    });

    const rejectedCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 2,
        [Op.or]: [
          { supervisor_rejected_by: userId },
          { squad_rejected_by: userId },
        ],
      },
    });

    const pendingCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 0,
        supervisor_verified_by: { [Op.ne]: null },
        supervisor_verification_status: 1,
        squad_verification_status: 0,
        squad_verified_by: null,
        created_by: userIdsMap,
      },
    });

    return {
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
    };
  } else {
    const users = await userModel.findAll({
      where: {
        created_by: userId,
      },
    });
    const userIdsMap = users.map((user) => user.id);

    const approvedCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 1,
        [Op.or]: [
          { squad_verified_by: userId },
          { supervisor_verified_by: userId },
        ],
      },
    });

    const rejectedCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 2,
        [Op.or]: [
          { supervisor_rejected_by: userId },
          { squad_rejected_by: userId },
        ],
      },
    });

    const pendingCount = await documentModel.count({
      where: {
        ...filters,
        final_verification_status: 0,
        created_by: userIdsMap,
        supervisor_verified_by: { [Op.ne]: null },
        supervisor_verification_status: 0,
        squad_verification_status: 0,
        squad_verified_by: null,
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
    let userTeam = {};

    const userRole = await roleModel.findByPk(req.user.role_id); // Fetch user role
    if (userRole.name === "Supervisor") {
      const supervisorBranches = await userBranches(
        req.user.role_id,
        req.user.id
      );
      const branch_users = await userStateToBranchModel.findAll({
        where: {
          branch_id: supervisorBranches,
          status: true,
        },
        attributes: ["user_id"],
      });
      const userCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          role_id: 4,
          created_by: req.user.id
        },
      });
      const activeUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: true,
          role_id: 4,
          created_by: req.user.id
        },
      });
      const inactiveUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: false,
          role_id: 4,
          created_by: req.user.id
        },
      });
      userTeam = {
        userCounts,
        activeUserCounts,
        inactiveUserCounts,
      };
    } else if (userRole.name === "Squad") {
      const squadBranches = await userBranches(req.user.role_id, req.user.id);
      const branch_users = await userStateToBranchModel.findAll({
        where: {
          branch_id: squadBranches,
          status: true,
        },
        attributes: ["user_id"],
      });
      const userCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          role_id: 2,
          created_by: req.user.id
        },
      });
      const activeUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: true,
          role_id: 2,
          created_by: req.user.id
        },
      });
      const inactiveUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: false,
          role_id: 2,
          created_by: req.user.id
        },
      });
      userTeam = {
        userCounts,
        activeUserCounts,
        inactiveUserCounts,
      };
    }

    const [userRecords, userDailyActivity, userMonthlyActivity] =
      await Promise.all([
        userRecordsPromise,
        userDailyActivityPromise,
        userMonthlyActivityPromise,
      ]);

    return res.send({
      userRecords: {
        ...userRecords,
        total: userTeam.userCounts,
        active: userTeam.activeUserCounts,
        inactive: userTeam.inactiveUserCounts,
      },
      userDailyActivity,
      userMonthlyActivity,
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: error.message });
  }
});
