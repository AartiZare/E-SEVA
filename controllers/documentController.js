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
const downloadLogModel = db.DownloadedDocumentLog;
const roleModel = db.Role;
const activityModel = db.Activity;
const userModel = db.User;
const branchModel = db.Branch;
const userStateToBranchModel = db.UserStateToBranch;
const issueTypeModel = db.IssueType;
const documentTypeModel = db.DocumentType;

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

// export const userBranches = async (roleId, userId) => {
//   if (roleId === 1) {
//     // Admin
//     return [];
//   } else if (roleId === 3) {
//     // Squad
//     const _userBranches = await userStateToBranchModel.findAll({
//       where: {
//         user_id: userId,
//       },
//       attributes: ["branch_id"],
//     });
//     return _userBranches.map((branch) => branch.branch_id);
//   } else if (roleId === 2) {
//     // Supervisor
//     const _userBranches = await userStateToBranchModel.findAll({
//       where: {
//         user_id: userId,
//       },
//       attributes: ["branch_id"],
//     });
//     return _userBranches.map((branch) => branch.branch_id);
//   } else if (roleId === 4) {
//     // User
//     const _userBranches = await userStateToBranchModel.findAll({
//       where: {
//         user_id: userId,
//       },
//       attributes: ["branch_id"],
//     });
//     return _userBranches.map((branch) => branch.branch_id);
//   } else if (roleId === 8) {
//     // RCS
//     const _userStates = await userStateToBranchModel.findAll({
//       where: {
//         user_id: userId,
//       },
//       attributes: ["state_id"],
//     });
//     const _userDivisions = await db.Division.findAll({
//       where: {
//         state_id: _userStates.map((state) => state.state_id),
//       },
//       attributes: ["id"],
//     });
//     const _userDistricts = await db.District.findAll({
//       where: {
//         division_id: _userDivisions.map((division) => division.id),
//       },
//       attributes: ["id"],
//     });
//     const _userTaluks = await db.Taluk.findAll({
//       where: {
//         district_id: _userDistricts.map((district) => district.id),
//       },
//       attributes: ["id"],
//     });
//     const _userBranches = await db.Branch.findAll({
//       where: {
//         taluk_id: _userTaluks.map((taluk) => taluk.id),
//       },
//       attributes: ["id"],
//     });
//     return _userBranches.map((branch) => branch.id);
//   } else if (roleId === 9) {
//     // ARCS
//     const _userDistricts = await userStateToBranchModel.findAll({
//       where: {
//         user_id: userId,
//       },
//       attributes: ["district_id"],
//     });
//     const _userTaluks = await db.Taluk.findAll({
//       where: {
//         district_id: _userDistricts.map((district) => district.district_id),
//       },
//       attributes: ["id"],
//     });
//     const _userBranches = await db.Branch.findAll({
//       where: {
//         taluk_id: _userTaluks.map((taluk) => taluk.id),
//       },
//       attributes: ["id"],
//     });
//     return _userBranches.map((branch) => branch.id);
//   } else if (roleId === 7) {
//     // Deputy Registrar
//     const _userDistricts = await userStateToBranchModel.findAll({
//       where: {
//         user_id: userId,
//       },
//       attributes: ["district_id"],
//     });
//     const _userTaluks = await db.Taluk.findAll({
//       where: {
//         district_id: _userDistricts.map((district) => district.district_id),
//       },
//       attributes: ["id"],
//     });
//     const _userBranches = await db.Branch.findAll({
//       where: {
//         taluk_id: _userTaluks.map((taluk) => taluk.id),
//       },
//       attributes: ["id"],
//     });
//     return _userBranches.map((branch) => branch.id);
//   } else if (roleId === 6) {
//     // Assistant Registrar
//     const _userTaluks = await db.Taluk.findAll({
//       where: {
//         district_id: _userDistricts.map((district) => district.district_id),
//       },
//       attributes: ["id"],
//     });
//     const _userBranches = await db.Branch.findAll({
//       where: {
//         talukId: _userTaluks.map((taluk) => taluk.id),
//       },
//       attributes: ["id"],
//     });
//     return _userBranches.map((branch) => branch.id);
//   } else if (roleId === 10) {
//     // Branch Registrar
//     const _userBranches = await userStateToBranchModel.findAll({
//       where: {
//         user_id: userId,
//       },
//       attributes: ["branch_id"],
//     });
//     return _userBranches.map((branch) => branch.branch_id);
//   }
// };

export const createDocument = catchAsync(async (req, res, next) => {
  try {
    logger.info("Entered createDocument method");

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

    // India Standard Time. Date format: dd-mm-yyyy
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
      `public/uploads/${slugify(body.branch_name)}/${slugify(
        body.document_reg_no
      )}`,
      `public/uploads/${slugify(body.branch_name)}/${slugify(
        documentData.document_reg_no
      )}/${slugify(body.document_reg_no)}.pdf`
    );
    logger.info("Images to pdf successfully converted");

    documentData.image_pdf = `${process.env.FILE_ACCESS_PATH}${slugify(
      body.branch_name
    )}/${slugify(documentData.document_reg_no)}/${slugify(
      body.document_reg_no
    )}.pdf`;

    // http://3.7.184.250/E-Seva/document/file?documentId=rajajinagar/upsc/upsc.pdf

    const newDocument = await documentModel.create(documentData);
    logger.info(
      `Document created: ${newDocument.document_name} (${newDocument.document_reg_no}), Unique ID: ${newDocument.document_unique_id}`
    );

    // Create activity entry after creating the document
    const documentUniqueId = newDocument.document_unique_id
      ? newDocument.document_unique_id
      : "not available";

    // Log user activity with current local time
    const currentTime = new Date();
    const offset = currentTime.getTimezoneOffset();
    const localTime = new Date(currentTime.getTime() - (offset * 60 * 1000));
    
    const activityData = {
      activity_title: "Document Created",
      activity_description: `The document ${newDocument.document_name} with registration number ${newDocument.document_reg_no} has been uploaded. The document's unique ID is ${documentUniqueId}, and it contains a total of ${newDocument.total_no_of_page} pages.`,
      activity_created_at: localTime,
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
  logger.info("Entered uploadDocumentFile method");
  try {
    const { headers } = req;
    const userId = req.user.id;

    // Deleting all images and pdfs from the directory but not the directory itself
    const uploadPath = `public/uploads/${slugify(
      headers["x-branch-name"]
    )}/${slugify(headers["x-document-reg-no"])}`;

    logger.info(`Deleting all files from directory: ${uploadPath}`);
    // fs.readdir(uploadPath, (err, files) => {
    //   if (err) {
    //     logger.error(`Error reading directory: ${err.toString()}`);
    //     return next(
    //       new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.toString())
    //     );
    //   }

    //   const xTimestamp = req.headers["x-timestamp"];
    //   for (const file of files) {
    //     if (!file.startsWith(xTimestamp)) {
    //       fs.unlink(path.join(uploadPath, file), (err) => {
    //         if (err) {
    //           logger.error(`Error deleting file: ${err.toString()}`);
    //           return next(
    //             new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.toString())
    //           );
    //         }
    //       });
    //     }
    //   }
    // });

    logger.info("All files deleted successfully");

    logger.info(`User ID: ${userId}`);
    logger.info(`Document headers: ${JSON.stringify(headers)}`);

    logger.info(
      `Document(images) uploaded: ${headers["x-branch-name"]} (${headers["x-document-reg-no"]})`
    );

    return res.send({ results: "success" });
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
      document.supervisor_verified_by = userId; // Set the supervisor who verified the document
      activityDescription = "approved by Supervisor";
    } else if (userRole.name === "Squad") {
      // Update squad_verification_status for approved
      document.squad_verification_status = 1;
      document.final_verification_status = 1;
      document.squad_verified_by = userId; // Set the squad who verified the document
      activityDescription = "approved by Squad";
    } else {
      // If user role is neither supervisor nor squad, return unauthorized
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    // Set the approved_at field with the current date and time
    document.approved_at = new Date();

    // Save the updated document
    await document.save();

    // Log user activity with current local time
    const currentTime = new Date();
    const offset = currentTime.getTimezoneOffset();
    const localTime = new Date(currentTime.getTime() - (offset * 60 * 1000));

    // Create activity entry after approving the document
    const activityData = {
      activity_title: "Document Approved",
      activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
      activity_created_at: localTime,
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

// export const approveDocument = catchAsync(async (req, res, next) => {
//   try {
//     const { documentId } = req.params; // Assuming documentId is passed in the request params
//     const userId = req.user.id; // Fetch user ID
//     const userRole = await roleModel.findByPk(req.user.role_id); // Fetch user role

//     // Find the document by ID
//     const document = await documentModel.findByPk(documentId);

//     // Check if the document exists
//     if (!document) {
//       return next(new ApiError(httpStatus.NOT_FOUND, "Document not found"));
//     }

//     // Check if the logged-in user is authorized to approve the document
//     let activityDescription = "";
//     if (userRole.name === "Supervisor") {
//       // Update supervisor_verification_status for approved
//       document.supervisor_verification_status = 1;
//       document.supervisor_verified_by = userId; // Set the supervisor who verified the document
//       activityDescription = "approved by Supervisor";
//     } else if (userRole.name === "Squad") {
//       // Update squad_verification_status for approved
//       document.squad_verification_status = 1;
//       document.final_verification_status = 1;
//       document.squad_verified_by = userId; // Set the squad who verified the document
//       activityDescription = "approved by Squad";
//     } else {
//       // If user role is neither supervisor nor squad, return unauthorized
//       return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
//     }

//     // Save the updated document
//     await document.save();

//     // Log user activity with current local time
//     const currentTime = new Date();
//     const offset = currentTime.getTimezoneOffset();
//     const localTime = new Date(currentTime.getTime() - (offset * 60 * 1000));

//     // Create activity entry after approving the document
//     const activityData = {
//       activity_title: "Document Approved",
//       activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
//       activity_created_at: localTime,
//       activity_created_by_id: userId,
//       activity_created_by_type: userRole.name,
//       activity_document_id: document.id,
//     };

//     await activityModel.create(activityData);

//     return res.send({
//       status: true,
//       data: document,
//       message: "Document approved successfully",
//     });
//   } catch (error) {
//     console.error(error.toString());
//     return res.status(500).send({ error: "Internal Server Error" });
//   }
// });

export const approveMultipleDocs = catchAsync(async (req, res, next) => {
  try {
    const { documentIds } = req.body;
    const userId = req.user.id; 
    const userRole = await roleModel.findByPk(req.user.role_id);

    if (userRole.name !== "Squad") {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    const results = [];

    for (const documentId of documentIds) {
      const document = await documentModel.findByPk(documentId);

      if (!document) {
        results.push({ documentId, status: false, message: "Document not found" });
        continue;
      }

      document.squad_verified_by = req.user.id;
      document.squad_verification_status = 1;
      document.final_verification_status = 1;
      document.approved_at = new Date();
      const activityDescription = "approved by Squad";

      document.updated_by = userId;
      await document.save();

            // Log user activity with current local time
      const currentTime = new Date();
      const offset = currentTime.getTimezoneOffset();
      const localTime = new Date(currentTime.getTime() - (offset * 60 * 1000));
      
      const activityData = {
        activity_title: "Document Approved",
        activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
        activity_created_at: localTime,
        activity_created_by_id: userId,
        activity_created_by_type: userRole.name,
        activity_document_id: document.id,
      };

      await activityModel.create(activityData);

      results.push({ documentId, status: true, message: "Document approved successfully", document });
    }

    return res.send({
      status: true,
      data: results,
      message: "Documents processed successfully",
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const pendingDocumentListUser = catchAsync(async (req, res, next) => {
  try {
    const { from_date, to_date, document_type, user_id, branch_id } = req.query;
    const user = req.user;

    let filter = {};

    if (user.role_id === 1) {
      // Admin
      filter.final_verification_status = 0;
    } else if (user.role_id === 2) {
      // Supervisor
      const _userBranches = await userStateToBranchModel.findAll({
        where: { user_id: user.id, status: true },
        attributes: ["branch_id"],
      });
      const branchIds = _userBranches.map(branch => branch.branch_id);
      const createdBySupervisor = await userModel.findAll({
        where: { created_by: user.id },
        attributes: ['id'],
      });
      const createdByUserIds = createdBySupervisor.map(user => user.id);
      filter.branch_id = branchIds;
      filter.final_verification_status = 0;
      filter.supervisor_verification_status = 0;
      filter[Op.or] = [
        { created_by: user.id },
        { created_by: { [Op.in]: createdByUserIds } }
      ];
    } else if (user.role_id === 3) {
      // Squad
      const _userBranches = await userStateToBranchModel.findAll({
        where: { user_id: user.id, status: true },
        attributes: ["branch_id"],
      });
      const branchIds = _userBranches.map(branch => branch.branch_id);
      const createdSupervisors = await userModel.findAll({
        where: { created_by: user.id, role_id: 2 }, // Supervisors
        attributes: ['id'],
      });
      const supervisorIds = createdSupervisors.map(supervisor => supervisor.id);
      const createdUsers = await userModel.findAll({
        where: { created_by: { [Op.in]: supervisorIds }, role_id: 4 }, // Users
        attributes: ['id'],
      });
      const userIds = createdUsers.map(user => user.id);
      filter.branch_id = branchIds;
      filter.supervisor_verification_status = 1;
      filter.squad_verification_status = 0;
      filter.squad_verified_by = null;
      filter[Op.or] = [
        { created_by: user.id },
        { created_by: { [Op.in]: supervisorIds } },
        { created_by: { [Op.in]: userIds } }
      ];
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
      filter.created_by = req.user.id;
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
      const _userDistricts = await userStateToBranchModel.findAll({
        where: { user_id: user.id, status: true },
        attributes: ["district_id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: { districtId: _userDistricts.map(district => district.district_id) },
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

    // Add date range filter if from_date and to_date are provided
    if (from_date && to_date) {
      const toDateEnd = new Date(to_date);
      toDateEnd.setHours(23, 59, 59, 999); // Set to end of the day
      filter.document_created_at = {
        [Op.between]: [new Date(from_date), toDateEnd],
      };
    } else if (from_date) {
      filter.document_created_at = {
        [Op.gte]: new Date(from_date),
      };
    } else if (to_date) {
      const toDateEnd = new Date(to_date);
      toDateEnd.setHours(23, 59, 59, 999); // Set to end of the day
      filter.document_created_at = {
        [Op.lte]: toDateEnd,
      };
    }

    if (document_type) {
      filter.document_type = document_type;
    }

    if (user_id) {
      filter.created_by = user_id;
    }

    if (branch_id) {
      filter.branch_id = branch_id;
    }

    const pendingDoc = await documentModel.findAll({ where: filter });

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
      filter.squad_rejected_by = req.user.id
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
      filter.supervisor_rejected_by = req.user.id;
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
      filter[Op.and] = {
        final_verification_status: 2,
        created_by: req.user.id
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

    rejectedDoc = await documentModel.findAll({
       where: filter,
       final_verification_status: 2
     });

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
    logger.info("Entered updateeDocument method");

    const { body } = req;
    const userId = req.user.id;
    const documentId = req.params.documentId;

    logger.info(`User ID: ${userId}`);
    logger.info(`Document body: ${JSON.stringify(body)}`);

    logger.info("Fetching user role");
    const userRole = await roleModel.findByPk(req.user.role_id);
    logger.info("Fetched user role");

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

    imagesToPdf(
      `public/uploads/${slugify(body.branch_name)}/${slugify(
        body.document_reg_no
      )}`,
      `public/uploads/${slugify(body.branch_name)}/${slugify(
        documentData.document_reg_no
      )}/${slugify(body.document_reg_no)}.pdf`
    );
    logger.info("Images to pdf successfully converted");

    documentData.image_pdf = `${process.env.FILE_ACCESS_PATH}${slugify(
      body.branch_name
    )}/${slugify(documentData.document_reg_no)}/${slugify(
      body.document_reg_no
    )}.pdf`;

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
  try {
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

    // Fetch the document type
    const documentType = await documentTypeModel.findByPk(document.document_type);

    const rejectionLog = await db.DocumentRejectionLog.findOne({
      where: {
        document_id: documentId,
      },
    });

    let documentRejectionFeedback = null;
    if (rejectionLog) {
      const issueTypes = rejectionLog.issue_types || [];
      const otherReason = rejectionLog.other_reasons || null;
      const rejectedBy = rejectionLog.rejected_by || null;
      const rejectedAt = rejectionLog.rejected_at || null;

      const issueTypeRecords = await db.IssueType.findAll({
        where: {
          id: issueTypes,
        },
      });

      const rejectedByDetails = await userModel.findByPk(rejectedBy);
      documentRejectionFeedback = {
        rejected_by: rejectedByDetails,
        rejected_at: rejectedAt,
        issue_types: issueTypeRecords,
        other_reason: otherReason,
      };
    }

    const documentWithRejectionReasons = {
      ...document.toJSON(),
      document_type: documentType, // Include the document type object
      ...(documentRejectionFeedback && { document_rejection_feedback: documentRejectionFeedback }),
    };

    return res.send({
      msg: "Document fetched successfully",
      data: documentWithRejectionReasons,
    });
  } catch (error) {
    console.error(error.toString());
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));
  }
});

export const rejectDocument = catchAsync(async (req, res, next) => {
  try {
    const { documentId } = req.params; 
    const { issueTypes, otherReason } = req.body;
    const userId = req.user.id;
    const userRole = await roleModel.findByPk(req.user.role_id);
    const document = await documentModel.findByPk(documentId);

    if (!document) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Document not found"));
    }

    let activityDescription = "";
    if (userRole.name === "Supervisor") {
      document.supervisor_verification_status = 2;
      document.final_verification_status = 2;
      document.supervisor_rejected_by = req.user.id;
      activityDescription = "rejected by Supervisor";
    } else if (userRole.name === "Squad") {
      document.squad_verification_status = 2;
      document.final_verification_status = 2;
      document.squad_rejected_by = req.user.id;
      activityDescription = "rejected by Squad";
    } else {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }
    
    document.rejected_at = new Date();
    await document.save();

    await db.DocumentRejectionLog.create({
      document_id: documentId,
      rejected_by: userId,
      issue_types: issueTypes,
      rejected_at: new Date(),
      other_reasons: otherReason || null,
    });

    // Log user activity with current local time
    const currentTime = new Date();
    const offset = currentTime.getTimezoneOffset();
    const localTime = new Date(currentTime.getTime() - (offset * 60 * 1000));

    const activityData = {
      activity_title: "Document Rejected",
      activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
      activity_created_at: localTime,
      activity_created_by_id: userId,
      activity_created_by_type: userRole.name,
      activity_document_id: document.id,
    };

    await activityModel.create(activityData);

    return res.send({
      status: true,
      data: {
        ...document.toJSON(),
        issue_types: issueTypes,
        other_reason: otherReason,
      },
      message: "Document rejected successfully",
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const rejectMultipleDocs = catchAsync(async (req, res, next) => {
  try {
    const { documentIds, issueTypes, otherReason } = req.body;
    const userId = req.user.id;
    const userRole = await roleModel.findByPk(req.user.role_id);
    if (userRole.name !== "Squad") {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    const results = [];

    for (const documentId of documentIds) {
      const document = await documentModel.findByPk(documentId);

      if (!document) {
        results.push({ documentId, status: false, message: "Document not found" });
        continue;
      }

      document.squad_rejected_by = req.user.id;
      document.squad_verification_status = 2;
      document.final_verification_status = 2;
      document.rejected_at = new Date();

      // Prepare data for DocumentRejectionLog
      const rejectionLogData = {
        document_id: documentId,
        rejected_by: userId,
        issue_types: issueTypes,
        rejected_at: new Date(),
        other_reasons: otherReason || null,
      };

      await db.DocumentRejectionLog.upsert(rejectionLogData);

      document.updated_by = userId;
      await document.save();

      // Log user activity with current local time
      const currentTime = new Date();
      const offset = currentTime.getTimezoneOffset();
      const localTime = new Date(currentTime.getTime() - (offset * 60 * 1000));

      const activityData = {
        activity_title: "Document Rejected",
        activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been rejected by Squad. Document Unique ID: ${document.document_unique_id}`,
        activity_created_at: localTime,
        activity_created_by_id: userId,
        activity_created_by_type: userRole.name,
        activity_document_id: document.id,
      };

      await activityModel.create(activityData);

      results.push({
        documentId,
        data: {
          ...document.toJSON(),
          issue_types: issueTypes,
          other_reason: otherReason,
        },
        status: true,
        message: "Document rejected successfully",
      });
    }

    return res.send({
      status: true,
      data: results,
      message: "Documents processed successfully",
    });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
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

    // Date Filters
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
    const renewables = await documentModel.count({
      where: { ...where, document_renewal_date: { [Op.lte]: new Date() } },
    });

    // Calculate total downloads based on user role
    let downloadWhere = {};

    if (req.user.role_id === 1) { // Admin
      // Admin can see all downloads
    } else {
      const userRole = await roleModel.findByPk(req.user.role_id);
      if (userRole.name === 'RCS') {
        const arcs = await userModel.findAll({
          where: { created_by: req.user.id, role_id: 9 },
          attributes: ['id'],
        });
        const arcsIds = arcs.map((arc) => arc.id);
        downloadWhere.downloaded_by = { [Op.in]: [req.user.id, ...arcsIds] };
      } else if (userRole.name === 'ARCS') {
        const users = await userModel.findAll({
          where: { created_by: req.user.id, role_id: 10 },
          attributes: ['id'],
        });
        const userIds = users.map((user) => user.id);
        downloadWhere.downloaded_by = { [Op.in]: [req.user.id, ...userIds] };
      } else if (userRole.name === 'Deputy Registrar' || userRole.name === 'Assistant Registrar' || userRole.name === 'Branch Registrar') {
        downloadWhere.downloaded_by = req.user.id;
      }
    }

    const downloads = await downloadLogModel.sum('download_count', { where: downloadWhere }) || 0;

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

// export const webDashboard = catchAsync(async (req, res, next) => {
//   try {
//     let where = {};

//     // Date Filters
//     if (req.body?.fromDate) {
//       where = {
//         ...where,
//         createdAt: {
//           [Op.gte]: req.body?.fromDate,
//         },
//       };
//     }
//     if (req.body?.toDate) {
//       where = {
//         ...where,
//         createdAt: {
//           [Op.lte]: req.body?.toDate,
//         },
//       };
//     }
//     if (req.body?.documentType) {
//       where = {
//         ...where,
//         document_type: req.body?.documentType,
//       };
//     }

//     // Add where condition based on the user role
//     // We need to find the user role by the auth token
//     // RCS => ARCS => Deputy Registrar => Assistant Registrar => Branch Registrar

//     const branches = await userBranches(req.user.role_id, req.user.id);
//     if (branches.length > 0) {
//       where.branch_id = branches;
//     }
//     where.final_verification_status = 1;

//     const responseData = {
//       uploads: 0,
//       pages: 0,
//       downloads: 0,
//       renewables: 0,
//       uploadsByDateAndType: {},
//       uploadsByDate: {},
//     };

//     const uploads = await documentModel.count({ where });
//     const pages = await documentModel.sum("total_no_of_page", { where });
//     const renewables = await documentModel.count({
//       where: { ...where, document_renewal_date: { [Op.lte]: new Date() } },
//     });

//     // Calculate total downloads based on user role
//     let downloadWhere = {};

//     if (req.user.role_id === 1) { // Admin
//       // Admin can see all downloads
//     } else {
//       const userRole = await roleModel.findByPk(req.user.role_id);
//       if (userRole.name === 'RCS') {
//         const arcs = await userModel.findAll({
//           where: { created_by: req.user.id, role_id: 9 },
//           attributes: ['id'],
//         });
//         const arcsIds = arcs.map((arc) => arc.id);
//         downloadWhere.downloaded_by = { [Op.in]: [req.user.id, ...arcsIds] };
//       } else if (userRole.name === 'ARCS') {
//         const users = await userModel.findAll({
//           where: { created_by: req.user.id, role_id: 10 },
//           attributes: ['id'],
//         });
//         const userIds = users.map((user) => user.id);
//         downloadWhere.downloaded_by = { [Op.in]: [req.user.id, ...userIds] };
//       } else if (userRole.name === 'Deputy Registrar' || userRole.name === 'Assistant Registrar' || userRole.name === 'Branch Registrar') {
//         downloadWhere.downloaded_by = req.user.id;
//       }
//     }

//     const downloads = await downloadLogModel.sum('download_count', { where: downloadWhere }) || 0;

//     // Recent 7 days uploads (fromDate will be 7 days before the current date)
//     const toDate = new Date();
//     const fromDate = new Date(new Date(toDate).setDate(toDate.getDate() - 6));
//     let allDates = [];
//     for (let i = 1; i < 7; i++) {
//       allDates.push(
//         new Date(
//           new Date(fromDate).setDate(fromDate.getDate() + i)
//         ).toISOString()
//       );
//     }
//     allDates = allDates.map((date) => {
//       return date.split("T")[0];
//     });

//     where.createdAt = {
//       [Op.between]: [
//         new Date(fromDate.setHours(0, 0, 0)),
//         new Date(toDate.setHours(23, 59, 59)),
//       ],
//     };

//     // Charts Data. fill the dates with 0 if no data available for that date and type
//     const uploadsByDateAndType = await documentModel.findAll({
//       where,
//       attributes: [
//         "document_type",
//         [db.sequelize.fn("DATE", db.sequelize.col("createdAt")), "createdAt"],
//         [db.sequelize.fn("COUNT", "document_type"), "count"],
//       ],
//       group: [
//         "document_type",
//         [db.sequelize.fn("DATE", db.sequelize.col("createdAt"))],
//       ],
//     });

//     const uniqueDocuments = [
//       ...new Set(uploadsByDateAndType.map((upload) => upload.document_type)),
//     ];
//     const chartData = {};
//     const chartDataByDate = {};
//     uniqueDocuments.forEach((documentType) => {
//       allDates.forEach((date) => {
//         if (!chartData[documentType]) {
//           chartData[documentType] = {};
//         }
//         if (!chartDataByDate[documentType]) {
//           chartDataByDate[documentType] = {};
//         }
//         const isExists = uploadsByDateAndType.find((upload) => {
//           return (
//             upload.document_type === documentType &&
//             new Date(upload.createdAt).toISOString().split("T")[0] === date
//           );
//         });
//         if (isExists) {
//           chartData[documentType][date] = parseInt(
//             isExists.dataValues.count,
//             10
//           );
//         } else {
//           chartData[documentType][date] = 0;
//         }
//         const isExistsByDate = uploadsByDateAndType.find((upload) => {
//           return (
//             upload.document_type === documentType &&
//             new Date(upload.createdAt).toISOString().split("T")[0] === date
//           );
//         });
//         if (isExistsByDate) {
//           chartDataByDate[documentType][date] = parseInt(
//             isExistsByDate.dataValues.count,
//             10
//           );
//         } else {
//           chartDataByDate[documentType][date] = 0;
//         }
//       });
//     });
//     const uploadsByDate = await documentModel.findAll({
//       where,
//       attributes: [
//         [db.sequelize.fn("DATE", db.sequelize.col("createdAt")), "createdAt"],
//         [db.sequelize.fn("COUNT", "createdAt"), "count"],
//       ],
//       group: [[db.sequelize.fn("DATE", db.sequelize.col("createdAt"))]],
//     });

//     const documentTypeNames = await db.DocumentType.findAll({
//       attributes: ["id", "name"],
//     });

//     responseData.uploads = uploads;
//     responseData.pages = pages;
//     responseData.downloads = downloads;
//     responseData.renewables = renewables;
//     responseData.uploadsByDateAndType = Object.keys(chartData).map((key) => {
//       const documentTypeName = documentTypeNames.find((type) => {
//         return parseInt(type.id, 10) === parseInt(key, 10);
//       });
//       return {
//         document_type: key,
//         data: chartData[key],
//         document_type_name: documentTypeName ? documentTypeName.name : null,
//       };
//     });
//     // Date wise uploads
//     responseData.uploadsByDate = uploadsByDate;

//     return res.send({ status: true, data: responseData });
//   } catch (error) {
//     console.error(error.toString());
//     return res.status(500).send({ error: "Internal Server Error" });
//   }
// });

export const getDocumentList = catchAsync(async (req, res) => {
  try {
    const { qFilter, search, from_date, to_date, document_type } = req.query;
    const userId = req.user.id;
    const userRoleId = req.user.role_id;

    let filter = {};

    if (userRoleId === 1) {
      // Admin: Show all documents with final_verification_status: 1
      filter.final_verification_status = 1;

    } else if (userRoleId === 8) {
      // RCS
      const _userStates = await userStateToBranchModel.findAll({
        where: {
          user_id: userId,
          status: true,
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
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 1;
    } else if (userRoleId === 9) {
      // ARCS
      const _userDistricts = await userStateToBranchModel.findAll({
        where: {
          user_id: userId,
          status: true,
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
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 1;
    } else if (userRoleId === 7) {
      // Deputy Registrar
      const _userDistricts = await userStateToBranchModel.findAll({
        where: {
          user_id: userId,
          status: true,
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
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 1;
    } else if (userRoleId === 6) {
      // Assistant Registrar
      const _userDistricts = await userStateToBranchModel.findAll({
        where: { user_id: userId, status: true },
        attributes: ["district_id"],
      });
      const _userTaluks = await db.Taluk.findAll({
        where: { district_id: _userDistricts.map(district => district.district_id) },
        attributes: ["id"],
      });
      const _userBranches = await db.Branch.findAll({
        where: {
          taluk_id: _userTaluks.map((taluk) => taluk.id),
        },
        attributes: ["id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 1;
    } else if (userRoleId === 10) {
      // Branch Registrar
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: userId,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch_id = _userBranches.map((branch) => branch.branch_id);
      filter.final_verification_status = 1;
    }

    if (qFilter) {
      filter = {
        ...filter,
        ...JSON.parse(qFilter),
      };
    }

    if (search) {
      const searchTerm = search?.trim();
      if (searchTerm !== "") {
        filter.document_name = {
          [Op.like]: `%${searchTerm}%`,
        };
      }
    }

    // Date filtering logic for document_created_at
    if (from_date && to_date) {
      filter.document_created_at = {
        [Op.between]: [new Date(from_date).toISOString(), new Date(to_date).toISOString()],
      };
    } else if (from_date) {
      filter.document_created_at = {
        [Op.gte]: new Date(from_date).toISOString(),
      };
    } else if (to_date) {
      filter.document_created_at = {
        [Op.lte]: new Date(to_date).toISOString(),
      };
    }

    if (document_type) {
      filter.document_type = document_type;
    }

    // Fetch documents based on the conditions
    const documents = await documentModel.findAll({
      where: {
        ...filter,
        final_verification_status: 1
      },
      attributes: [
        'id', 'image_pdf', 'document_name', 'document_reg_no', 'document_unique_id', 'authorised_persons',
        'document_reg_date', 'document_renewal_date', 'total_no_of_page', 'created_by', 
        'updated_by', 'document_type', 'branch_id', 'squad_verified_by', 'supervisor_verified_by', 
        'squad_rejected_by', 'supervisor_rejected_by', 'supervisor_verification_status', 
        'squad_verification_status', 'final_verification_status', 'status', 'document_upload_status', 
        'document_created_at', 'createdAt', 'updatedAt'
      ],
    });

    // Fetch document type details for each document
    const completeDocuments = await Promise.all(
      documents.map(async (doc) => {
        const documentType = await documentTypeModel.findByPk(doc.document_type);
        return {
          ...doc.toJSON(),
          document_type: documentType ? { id: documentType.id, name: documentType.name } : { id: doc.document_type, name: 'Unknown' },
        };
      })
    );

    return res.send({
      results: completeDocuments,
      total: completeDocuments.length,
    });
  } catch (error) {
    console.log('Error:', error);
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
    return res.status(400).send({
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

export const deleteImages = catchAsync((req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).send({ error: "File path is required" });
    }

    logger.info(`Deleting file: ${filePath}`);
    const filePathSplitted = filePath.split("=")[1];
    const uploadPath = path.join(
      __dirname,
      `../public/uploads/${filePathSplitted}`
    );
    fs.unlink(uploadPath, (err) => {
      if (err) {
        logger.error(`Error deleting file: ${err}`);
        return res.status(500).send({ error: "Internal Server Error" });
      }
      logger.info(`File deleted: ${uploadPath}`);
      return res.send({ message: "File deleted successfully" });
    });
  } catch (error) {
    logger.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});
