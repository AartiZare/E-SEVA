import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
dotenv.config();
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import logger from "../loggers.js";
import db from "../models/index.js";
import { slugify } from "light-string-utils";
import { imagesToPdf } from "../utils/imagesToPdf.js";
import fs from "fs";
import { fileURLToPath } from "url";

// Function to get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const documentModel = db.Document;
const roleModel = db.Role;
const activityModel = db.Activity;
const userModel = db.User;
const branchModel = db.Branch;
const userStateToBranchModel = db.UserStateToBranch;

export const userBranches = async (roleId, userId) => {
  if (roleId === 1) {
    // Admin
    return [];
  } else if (roleId === 3) {
    // Squad
    const _userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["branch_id"],
    });
    return _userBranches.map((branch) => branch.branch_id);
  } else if (roleId === 2) {
    // Supervisor
    const _userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["branch_id"],
    });
    return _userBranches.map((branch) => branch.branch_id);
  } else if (roleId === 4) {
    // User
    const _userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["branch_id"],
    });
    return _userBranches.map((branch) => branch.branch_id);
  } else if (roleId === 8) {
    // RCS
    const _userStates = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["state_id"],
    });
    const _userDivisions = await db.Division.findAll({
      where: {
        state_id: _userStates.map((state) => state.state_id),
      },
      attributes: ["id"],
    });
    const _userDistricts = await db.District.findAll({
      where: {
        division_id: _userDivisions.map((division) => division.id),
      },
      attributes: ["id"],
    });
    const _userTaluks = await db.Taluk.findAll({
      where: {
        district_id: _userDistricts.map((district) => district.id),
      },
      attributes: ["id"],
    });
    const _userBranches = await db.Branch.findAll({
      where: {
        taluk_id: _userTaluks.map((taluk) => taluk.id),
      },
      attributes: ["id"],
    });
    return _userBranches.map((branch) => branch.id);
  } else if (roleId === 9) {
    // ARCS
    const _userDistricts = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["district_id"],
    });
    const _userTaluks = await db.Taluk.findAll({
      where: {
        district_id: _userDistricts.map((district) => district.district_id),
      },
      attributes: ["id"],
    });
    const _userBranches = await db.Branch.findAll({
      where: {
        taluk_id: _userTaluks.map((taluk) => taluk.id),
      },
      attributes: ["id"],
    });
    return _userBranches.map((branch) => branch.id);
  } else if (roleId === 7) {
    // Deputy Registrar
    const _userDistricts = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["district_id"],
    });
    const _userTaluks = await db.Taluk.findAll({
      where: {
        district_id: _userDistricts.map((district) => district.district_id),
      },
      attributes: ["id"],
    });
    const _userBranches = await db.Branch.findAll({
      where: {
        taluk_id: _userTaluks.map((taluk) => taluk.id),
      },
      attributes: ["id"],
    });
    return _userBranches.map((branch) => branch.id);
  } else if (roleId === 6) {
    // Assistant Registrar
    const _userTaluks = await db.Taluk.findAll({
      where: {
        district_id: _userDistricts.map((district) => district.district_id),
      },
      attributes: ["id"],
    });
    const _userBranches = await db.Branch.findAll({
      where: {
        talukId: _userTaluks.map((taluk) => taluk.id),
      },
      attributes: ["id"],
    });
    return _userBranches.map((branch) => branch.id);
  } else if (roleId === 10) {
    // Branch Registrar
    const _userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["branch_id"],
    });
    return _userBranches.map((branch) => branch.branch_id);
  }
};

export const createDocument = catchAsync(async (req, res, next) => {
  logger.info("Entered createDocument method");
  try {
    logger.info(req);
    const { body, file } = req;
    const userId = req.user.id;

    logger.info(`User ID: ${userId}`);
    logger.info(`Document body: ${JSON.stringify(body)}`);

    logger.info("Fetching user role");
    const userRole = await roleModel.findByPk(req.user.role_id);
    logger.info("Fetched user role");

    logger.info("Checking if document exists");
    const isDocumentExist = await documentModel.findOne({
      where: {
        [Op.and]: [
          { document_name: body.document_name },
          { document_reg_no: body.document_reg_no },
        ],
      },
    });
    logger.info("Checked document existence");

    if (isDocumentExist) {
      logger.warn(
        `Document already exists: ${body.document_name} - ${body.document_reg_no}`
      );
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Document with name ${body.document_name} and registration number ${body.document_reg_no} already exists!`
        )
      );
    }

    const documentData = {
      document_name: body.document_name,
      document_reg_no: body.document_reg_no,
      supervisor_verification_status: 0,
      squad_verification_status: 0,
      final_verification_status: 0,
      document_reg_date: body.document_reg_date,
      document_renewal_date: body.document_renewal_date,
      total_no_of_page: body.total_no_of_page,
      authorised_persons: body.authorised_persons.map((person) => ({
        authorised_person_name: person.authorised_person_name,
        contact_number: person.contact_number,
        alternate_number: person.alternate_number || null,
        email: person.email,
        designation: person.designation,
      })),
      branch_id: body.branch_id,
      total_no_of_date: body.total_no_of_date,
      document_unique_id: body.document_unique_id,
      document_type: body.document_type,
      created_by: userId,
      updated_by: userId,
      document_upload_status: "UPLOADING",
      document_created_at: new Date(),
    };

    // india standard time. date format: dd-mm-yyyy
    const todayDMY = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    logger.info("Counting documents created today");
    const count = await documentModel.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0)),
          [Op.lt]: new Date(new Date().setHours(23, 59, 59)),
        },
      },
    });

    // create unique id
    // console.log("count", count);
    logger.info(`Counted documents created today: ${count}`);

    documentData.document_unique_id = `${todayDMY.split("/").join("-")}-${
      count + 1
    }`;
    logger.info(
      `Generated document unique ID: ${documentData.document_unique_id}`
    );

    logger.info("Creating new document in the database");

    // Generating images to pdf before creating the data

    imagesToPdf(
      `public/uploads/${body.branch_name}/${body.document_reg_no}`,
      `public/uploads/${body.branch_name}/${slugify(
        documentData.document_reg_no
      )}/${slugify(body.document_reg_no)}.pdf`
    );

    const newDocument = await documentModel.create(documentData);
    logger.info(
      `Document created: ${newDocument.document_name} (${newDocument.document_reg_no}), Unique ID: ${newDocument.document_unique_id}`
    );

    // Create activity entry after creating the document
    const documentUniqueId = newDocument.document_unique_id
      ? newDocument.document_unique_id
      : "not available";

    const activityData = {
      activity_title: "Document Created",
      activity_description: `Document ${newDocument.document_name} with registration number ${newDocument.document_reg_no} has been uploaded. Document Unique ID: ${documentUniqueId}`,
      activity_created_at: newDocument.createdAt,
      activity_created_by_id: req.user.id,
      activity_created_by_type: userRole.name,
      activity_document_id: newDocument.id,
    };

    logger.info("Creating activity log for the new document");
    await activityModel.create(activityData);
    logger.info(
      `Activity logged for document creation: ${newDocument.document_name} (${newDocument.document_reg_no})`
    );

    return res.send({ results: newDocument });
  } catch (error) {
    logger.error(`Error in createDocument: ${error.toString()}`);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const uploadDocumentFile = catchAsync(async (req, res, next) => {
  logger.info("Entered documentDocument method");
  try {
    return res.send({ results: "success" });
    const { body, file } = req;
    const userId = req.user.id;

    logger.info(`User ID: ${userId}`);
    logger.info(`Document body: ${JSON.stringify(body)}`);

    logger.info("Fetching user role");
    const userRole = await roleModel.findByPk(req.user.role_id);
    logger.info("Fetched user role");

    logger.info("Checking if document exists");

    const documentData = {};

    // const id = crypto.randomBytes(16).toString('hex')
    if (file) {
      logger.info("Creating file path for uploaded file");
      documentData.image_pdf = `${process.env.FILE_ACCESS_PATH}${
        body.branch_name
      }/${body.document_reg_no}${path.extname(file.originalname)}`;
      logger.info(`File path created: ${documentData.image_pdf}`);
      documentData.document_upload_status = "SUCCESS";
    }

    // india standard time. date format: dd-mm-yyyy
    const todayDMY = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    logger.info("Counting documents created today");
    const count = await documentModel.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0)),
          [Op.lt]: new Date(new Date().setHours(23, 59, 59)),
        },
      },
    });

    logger.info("Updating the document in the database by registration number");
    const rowsUpdated = await documentModel.update(documentData, {
      where: {
        document_reg_no: body.document_reg_no,
      },
    });
    logger.info(
      `Document uploaded: ${rowsUpdated.document_name} (${rowsUpdated.document_reg_no}), Unique ID: ${rowsUpdated.document_unique_id}`
    );

    // Create activity entry after creating the document
    const documentUniqueId = rowsUpdated.document_unique_id
      ? rowsUpdated.document_unique_id
      : "not available";

    const activityData = {
      activity_title: "Document File uploaded",
      activity_description: `Document ${rowsUpdated.document_name} with registration number ${rowsUpdated.document_reg_no} has been uploaded. Document Unique ID: ${documentUniqueId}`,
      activity_created_at: rowsUpdated.createdAt,
      activity_created_by_id: req.user.id,
      activity_created_by_type: userRole.name,
      activity_document_id: rowsUpdated.id,
    };

    logger.info("Creating activity log for the new document");
    await activityModel.create(activityData);
    logger.info(
      `Activity logged for document creation: ${rowsUpdated.document_name} (${rowsUpdated.document_reg_no})`
    );

    return res.send({ results: rowsUpdated });
  } catch (error) {
    logger.error(`Error in createDocument: ${error.toString()}`);
    // const documentData = {};
    // documentData.document_upload_status = "FAILED";
    // await documentModel.update(documentData, {
    //   where: {
    //     document_reg_no: body.document_reg_no,
    //   },
    // });

    return res
      .status(500)
      .send({ error: "Internal Server Error" + error.toString() });
  }
});

export const userDocumentList = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = await roleModel.findByPk(req.user.role_id);

    let userDocs;
    let filter = {};

    userDocs = await documentModel.findAll({
      where: {
        created_by: userId,
      },
    });

    return res.send({ status: true, data: userDocs });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const approveDocument = catchAsync(async (req, res, next) => {
  try {
    const { documentId } = req.params; // Assuming documentId is passed in the request params
    const userId = req.user.id; // Fetch user ID
    const userRole = await roleModel.findByPk(req.user.role_id); // Fetch user role

    // Find the document by ID
    const document = await documentModel.findByPk(documentId);

    // Check if the document exists
    if (!document) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Document not found"));
    }

    // Check if the logged-in user is authorized to approve the document
    let activityDescription = "";
    if (userRole.name === "Supervisor") {
      // Update supervisor_verification_status for approved
      document.supervisor_verification_status = 1;
      activityDescription = "approved by Supervisor";
    } else if (userRole.name === "Squad") {
      // Update squad_verification_status for approved
      document.squad_verification_status = 1;
      document.final_verification_status = 1;
      activityDescription = "approved by Squad";
    } else {
      // If user role is neither supervisor nor squad, return unauthorized
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    // Save the updated document
    document.updated_by = userId;
    await document.save();

    // Create activity entry after approving the document
    const activityData = {
      activity_title: "Document Approved",
      activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
      activity_created_at: document.updatedAt,
      activity_created_by_id: userId,
      activity_created_by_type: userRole.name,
      activity_document_id: document.id,
    };

    await activityModel.create(activityData);

    return res.send({
      status: true,
      data: document,
      message: "Document approved successfully",
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const rejectDocument = catchAsync(async (req, res, next) => {
  try {
    const { documentId } = req.params; // Assuming documentId is passed in the request params
    const userId = req.user.id; // Fetch user ID
    const userRole = await roleModel.findByPk(req.user.role_id); // Fetch user role

    // Find the document by ID
    const document = await documentModel.findByPk(documentId);

    // Check if the document exists
    if (!document) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Document not found"));
    }

    // Check if the logged-in user is authorized to reject the document
    let activityDescription = "";
    if (userRole.name === "Supervisor") {
      // Update supervisor_verification_status for rejection
      document.supervisor_verification_status = 2;
      document.final_verification_status = 2;
      activityDescription = "rejected by Supervisor";
    } else if (userRole.name === "Squad") {
      // Update squad_verification_status for rejection
      document.squad_verification_status = 2;
      document.final_verification_status = 2;
      activityDescription = "rejected by Squad";
    } else {
      // If user role is neither supervisor nor squad, return unauthorized
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    // Save the updated document
    document.updated_by = userId;

    await document.save();

    // Create activity entry after rejecting the document
    const activityData = {
      activity_title: "Document Rejected",
      activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
      activity_created_at: document.updatedAt,
      activity_created_by_id: userId,
      activity_created_by_type: userRole.name,
      activity_document_id: document.id,
    };

    await activityModel.create(activityData);

    return res.send({
      status: true,
      data: document,
      message: "Document rejected successfully",
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const pendingDocumentListUser = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    const userRole = await roleModel.findByPk(user.role_id);

    let pendingDoc;
    let filter = {};

    if (user.role_id === 1) {
      // Admin
      filter.final_verification_status = 0;
    } else if (user.role_id === 3) {
      // Squad
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.squad_verification_status = 0;
    } else if (user.role_id === 2) {
      // Supervisor
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.supervisor_verification_status = 0;
    } else if (user.role_id === 4) {
      // User
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });

      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.final_verification_status = 0;
    } else if (user.role_id === 8) {
      // RCS
      const _userStates = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["state_id"],
      });
      const _userDivisions = await db.Division.findAll({
        where: {
          stateId: _userStates.map((state) => state.state_id),
          // status: true
        },
        attributes: ["id"],
      });
      const _userDistricts = await db.District.findAll({
        where: {
          divisionId: _userDivisions.map((division) => division.id),
          // status: true
        },
        attributes: ["id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.id),
          // status: true
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
          // status: true
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.role_id === 9) {
      // ARCS
      const _userDistricts = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["district_id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.district_id),
          // status: true
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
          // status: true
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.role_id === 7) {
      // Deputy Registrar
      const _userDistricts = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["district_id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.district_id),
          // status: true
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
          // status: true
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.role_id === 6) {
      // Assistant Registrar
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.district_id),
          // status: true
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
          // status: true
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.role_id === 10) {
      // Branch Registrar
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.final_verification_status = 0;
    }
    pendingDoc = await documentModel.findAll({ where: filter });

    return res.send({ status: true, data: pendingDoc });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const rejectedDocumentListUser = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    const userRole = await roleModel.findByPk(user.role_id);

    let rejectedDoc;
    let filter = {};

    if (user.role_id === 1) {
      // Admin
      filter.final_verification_status = 0;
    } else if (user.role_id === 3) {
      // Squad
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.squad_verification_status = 2;
    } else if (user.role_id === 2) {
      // Supervisor
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.supervisor_verification_status = 2;
    } else if (user.role_id === 4) {
      // User
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter[Op.or] = {
        supervisor_verification_status: 2,
        squad_verification_status: 2,
      };
    } else if (user.role_id === 8) {
      // RCS
      const _userStates = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["state_id"],
      });
      const _userDivisions = await db.Division.findAll({
        where: {
          stateId: _userStates.map((state) => state.state_id),
        },
        attributes: ["id"],
      });
      const _userDistricts = await db.District.findAll({
        where: {
          divisionId: _userDivisions.map((division) => division.id),
        },
        attributes: ["id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.id),
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.role_id === 9) {
      // ARCS
      const _userDistricts = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["district_id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.district_id),
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.role_id === 7) {
      // Deputy Registrar
      const _userDistricts = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["district_id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.district_id),
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.role_id === 6) {
      // Assistant Registrar
      const _userTaluks = await db.Taluk.findAll({
        where: {
          districtId: _userDistricts.map((district) => district.district_id),
        },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          talukId: _userTaluks.map((taluk) => taluk.id),
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.role_id === 10) {
      // Branch Registrar
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.final_verification_status = 2;
    }

    rejectedDoc = await documentModel.findAll({ where: filter });

    return res.send({ status: true, data: rejectedDoc });
  } catch (error) {
    console.error(error.toString());
    return res
      .status(500)
      .send({ error: "Internal Server Error", errorMessage: error.toString() });
  }
});

export const updateDocument = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.documentId;
    const updatedData = req.body;
    const { file } = req;

    const document = await documentModel.findOne({
      where: {
        id: documentId,
      },
    });

    // const branch = await branchModel.findByPk(document.branch);
    // If document not found, return error
    if (!document) {
      return next(
        new ApiError(
          httpStatus.NOT_FOUND,
          `Document with id ${documentId} not found`
        )
      );
    }

    // Handle file upload if present
    // let documentFileUrl;
    // Not required to update the file. its always the same name and same extension
    // if (req.file) {
    //   // documentFileUrl = `${process.env.FILE_PATH}${req.file.originalname}`;
    //   documentFileUrl = `${process.env.FILE_ACCESS_PATH}${body.branch_name}/${
    //     body.document_reg_no
    //   }${path.extname(file.originalname)}`;
    // }

    // Update document data
    const documentData = {
      ...updatedData,
      supervisor_verification_status: 0, // Reseting to make it as a fresh verification
      squad_verification_status: 0, // Reseting to make it as a fresh verification
      final_verification_status: 0, // Reseting to make it as a fresh verification
    };

    if (file) {
      documentData.image_pdf = `${process.env.FILE_ACCESS_PATH}${
        req.body.branch_name
      }/${req.body.document_reg_no}${path.extname(file.originalname)}`;
    }

    // Update the document in the database
    const rowsUpdated = await documentModel.update(documentData, {
      where: {
        id: documentId,
      },
    });

    // Fetch the updated document
    const updatedDocument = await documentModel.findOne({
      where: {
        id: documentId,
      },
    });

    // Send the updated document as response
    return res.send({
      message: "Document updated successfully",
      updatedDocument,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const getDocumentById = catchAsync(async (req, res, next) => {
  const documentId = req.params.documentId;
  const document = await documentModel.findByPk(documentId);
  if (!document) {
    return next(
      new ApiError(
        httpStatus.NOT_FOUND,
        `Document with id ${documentId} not found`
      )
    );
  }
  return res.send({ msg: "Document fetched successfully", data: document });
});

export const getDocFileByDocId = catchAsync(async (req, res, next) => {
  try {
    const documentId = req.query.documentId;

    const filePath = path.join(`${process.env.FILE_PATH}` + documentId);
    // `${process.env.FILE_ACCESS_PATH}${body.branch_name}/${body.document_reg_no}${path.extname(file.originalname)}`;

    console.log(filePath, "uploaded file");

    res.sendFile(filePath, (err) => {
      if (err) {
        next(
          new ApiError(httpStatus.INTERNAL_SERVER_ERROR, JSON.stringify(err))
        );
      }
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const webDashboard = catchAsync(async (req, res, next) => {
  try {
    let where = {};
    if (req.body?.fromDate) {
      where = {
        ...where,
        createdAt: {
          [Op.gte]: req.body?.fromDate,
        },
      };
    }
    if (req.body?.toDate) {
      where = {
        ...where,
        createdAt: {
          [Op.lte]: req.body?.toDate,
        },
      };
    }
    if (req.body?.documentType) {
      where = {
        ...where,
        document_type: req.body?.documentType,
      };
    }

    // Add where condition based on the user role
    // We need to find the user role by the auth token
    // RCS => ARCS => Deputy Registrar => Assistant Registrar => Branch Registrar

    const branches = await userBranches(req.user.role_id, req.user.id);
    if (branches.length > 0) {
      where.branch_id = branches;
    }
    where.final_verification_status = 1;

    const responseData = {
      uploads: 0,
      pages: 0,
      downloads: 0,
      renewables: 0,
      uploadsByDateAndType: {},
      uploadsByDate: {},
    };

    const uploads = await documentModel.count({ where });
    const pages = await documentModel.sum("total_no_of_page", { where });
    const downloads = 0;
    const renewables = await documentModel.count({
      where: { ...where, document_renewal_date: { [Op.lte]: new Date() } },
    });

    // Recent 7 days uploads (fromDate will be 7 days before the current date)
    const toDate = new Date();
    const fromDate = new Date(new Date(toDate).setDate(toDate.getDate() - 6));
    let allDates = [];
    for (let i = 1; i < 7; i++) {
      allDates.push(
        new Date(
          new Date(fromDate).setDate(fromDate.getDate() + i)
        ).toISOString()
      );
    }
    allDates = allDates.map((date) => {
      return date.split("T")[0];
    });

    where.createdAt = {
      [Op.between]: [
        new Date(fromDate.setHours(0, 0, 0)),
        new Date(toDate.setHours(23, 59, 59)),
      ],
    };

    // Charts Data. fill the dates with 0 if no data available for that date and type
    const uploadsByDateAndType = await documentModel.findAll({
      where,
      attributes: [
        "document_type",
        [db.sequelize.fn("DATE", db.sequelize.col("createdAt")), "createdAt"],
        [db.sequelize.fn("COUNT", "document_type"), "count"],
      ],
      group: [
        "document_type",
        [db.sequelize.fn("DATE", db.sequelize.col("createdAt"))],
      ],
    });

    const uniqueDocuments = [
      ...new Set(uploadsByDateAndType.map((upload) => upload.document_type)),
    ];
    const chartData = {};
    const chartDataByDate = {};
    uniqueDocuments.forEach((documentType) => {
      allDates.forEach((date) => {
        if (!chartData[documentType]) {
          chartData[documentType] = {};
        }
        if (!chartDataByDate[documentType]) {
          chartDataByDate[documentType] = {};
        }
        const isExists = uploadsByDateAndType.find((upload) => {
          return (
            upload.document_type === documentType &&
            new Date(upload.createdAt).toISOString().split("T")[0] === date
          );
        });
        if (isExists) {
          chartData[documentType][date] = parseInt(
            isExists.dataValues.count,
            10
          );
        } else {
          chartData[documentType][date] = 0;
        }
        const isExistsByDate = uploadsByDateAndType.find((upload) => {
          return (
            upload.document_type === documentType &&
            new Date(upload.createdAt).toISOString().split("T")[0] === date
          );
        });
        if (isExistsByDate) {
          chartDataByDate[documentType][date] = parseInt(
            isExistsByDate.dataValues.count,
            10
          );
        } else {
          chartDataByDate[documentType][date] = 0;
        }
      });
    });
    const uploadsByDate = await documentModel.findAll({
      where,
      attributes: [
        [db.sequelize.fn("DATE", db.sequelize.col("createdAt")), "createdAt"],
        [db.sequelize.fn("COUNT", "createdAt"), "count"],
      ],
      group: [[db.sequelize.fn("DATE", db.sequelize.col("createdAt"))]],
    });

    const documentTypeNames = await db.DocumentType.findAll({
      attributes: ["id", "name"],
    });

    responseData.uploads = uploads;
    responseData.pages = pages;
    responseData.downloads = downloads;
    responseData.renewables = renewables;
    responseData.uploadsByDateAndType = Object.keys(chartData).map((key) => {
      const documentTypeName = documentTypeNames.find((type) => {
        return parseInt(type.id, 10) === parseInt(key, 10);
      });
      return {
        document_type: key,
        data: chartData[key],
        document_type_name: documentTypeName ? documentTypeName.name : null,
      };
    });
    // Date wise uploads
    responseData.uploadsByDate = uploadsByDate;

    return res.send({ status: true, data: responseData });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const getDocumentList = catchAsync(async (req, res) => {
  try {
    const { qFilter, search, from_date, to_date, document_type } = req.query;

    let conditions = {};

    if (qFilter) {
      conditions = {
        ...JSON.parse(qFilter),
      };
    }

    if (search) {
      const searchTerm = search.trim();
      if (searchTerm !== "") {
        conditions.document_name = {
          [Op.like]: `%${searchTerm}%`,
        };
      }
    }

    if (from_date && to_date) {
      conditions.document_reg_date = {
        [Op.between]: [new Date(from_date), new Date(to_date)],
      };
    } else if (from_date) {
      conditions.document_reg_date = {
        [Op.gte]: new Date(from_date),
      };
    } else if (to_date) {
      conditions.document_reg_date = {
        [Op.lte]: new Date(to_date),
      };
    }

    if (document_type) {
      conditions.document_type = document_type;
    }

    const documents = await documentModel.findAll({
      where: {
        ...conditions,
        final_verification_status: 1,
      },
    });

    return res.send({
      results: documents,
      total: documents.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const getDocumentListUser = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    const userRole = await roleModel.findByPk(user.role_id);

    let docList;
    let where = {};

    const branches = await userBranches(req.user.role_id, req.user.id);
    if (branches.length > 0) {
      where.branch_id = branches;
    }
    docList = await documentModel.findAll({ where });

    return res.send({ status: true, data: docList });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const getImages = (req, res) => {
  const { branch_name, document_reg_no } = req.query;

  if (!branch_name || !document_reg_no) {
    logger.warn("Branch name or document registration number not provided");
    return res
      .status(400)
      .send({
        error: "Branch name and document registration number are required",
      });
  }

  const uploadPath = path.join(
    __dirname,
    `../public/uploads/${branch_name}/${document_reg_no}`
  );

  logger.info(`Fetching images from path: ${uploadPath}`);

  if (!fs.existsSync(uploadPath)) {
    logger.warn(`Directory does not exist: ${uploadPath}`);
    return res
      .status(404)
      .send({ error: `Directory not found: ${uploadPath}` });
  }

  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      logger.error(`Error reading directory: ${err}`);
      return res.status(500).send({ error: "Internal Server Error" });
    }

    const sortedFiles = files
      .filter((file) => !/\.pdf$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const fileUrls = sortedFiles.map(
      (file) =>
        `${process.env.FILE_ACCESS_PATH}${branch_name}/${document_reg_no}/${file}`
    );
    logger.info(`Found files: ${JSON.stringify(fileUrls)}`);
    return res.send({ images: fileUrls });
  });
};
