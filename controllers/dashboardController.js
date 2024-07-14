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

// Function to fetch user records based on filters
const fetchUserRecords = async (req) => {
  const userId = req.user.id;
  const { fromDate, toDate, branch_id, date, user_id } = req.query;

  let filters = {};

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

  if (branch_id) {
    filters.branch_id = branch_id;
  }

  if (user_id) {
    filters.created_by = user_id; // Add user_id filter for created_by
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
    },
    raw: true, // Ensure raw results for easier inspection
    logging: (msg) => console.log('Sequelize Query for Approved Documents:', msg),
  });

  const rejectedDocuments = await documentModel.findAll({
    where: {
      ...filters,
      final_verification_status: 2,
    },
    raw: true, // Ensure raw results for easier inspection
    logging: (msg) => console.log('Sequelize Query for Rejected Documents:', msg),
  });

  const pendingDocuments = await documentModel.findAll({
    where: {
      ...filters,
      final_verification_status: 0,
    },
    raw: true, // Ensure raw results for easier inspection
    logging: (msg) => console.log('Sequelize Query for Pending Documents:', msg),
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
  const { date, user_id } = req.query;

  const currentDate = new Date();
  currentDate.setUTCHours(0, 0, 0, 0);

  const startDate = new Date(currentDate);
  const endDate = new Date(currentDate);
  endDate.setUTCHours(23, 59, 59, 999);

  if (date) {
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setTime(selectedDate.getTime());
    endDate.setTime(selectedDate.getTime());
  }

  const userRole = await roleModel.findByPk(req.user.role_id); // Fetch user role
  if (userRole.name === "User") {
    const filters = {
      created_by: user_id || userId,  // Add user_id filter if provided
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
      activity_created_by_id: user_id || userId,  // Add user_id filter if provided
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
      activity_created_by_id: user_id || userId,  // Add user_id filter if provided
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
  const { date, user_id } = req.query;

  const currentDate = new Date();
  currentDate.setUTCHours(23, 59, 59, 999); // Set current date to end of the day

  let firstDayOfMonth;
  if (date) {
    const selectedDate = new Date(date);
    firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  } else {
    firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
  }
  firstDayOfMonth.setUTCHours(0, 0, 0, 0); // Set first day of the month to start of the day

  const startDate = firstDayOfMonth;
  const endDate = new Date(currentDate);
  endDate.setUTCHours(23, 59, 59, 999);

  if (date) {
    const selectedDate = new Date(date);
    startDate.setFullYear(selectedDate.getFullYear());
    startDate.setMonth(selectedDate.getMonth());
    startDate.setDate(1);
    endDate.setFullYear(selectedDate.getFullYear());
    endDate.setMonth(selectedDate.getMonth());
  }

  const filters = {
    created_by: user_id || userId,  // Add user_id filter if provided
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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
};

// Function to fetch all user data
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
        },
      });
      const activeUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: true,
          role_id: 4,
        },
      });
      const inactiveUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: false,
          role_id: 4,
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
        },
      });
      const activeUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: true,
          role_id: 2,
        },
      });
      const inactiveUserCounts = await db.User.count({
        where: {
          id: branch_users.map((user) => user.user_id),
          status: false,
          role_id: 2,
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
