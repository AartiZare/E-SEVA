import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
dotenv.config();
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const documentModel = db.Document;
const roleModel = db.Role;
const activityModel = db.Activity;
const userModel = db.User;
const branchModel = db.Branch;
const userStateToBranchModel = db.UserStateToBranch;

export const createDocument = catchAsync(async (req, res, next) => {
  try {
    const { body, file } = req;
    const userId = req.user.id;

    console.log(userId, "user id");

    console.log("Document body", body);

    const userRole = await roleModel.findByPk(req.user.roleId);
    const isDocumentExist = await documentModel.findOne({
      where: {
        [Op.and]: [
          { document_name: body.document_name },
          { document_reg_no: body.document_reg_no },
        ],
      },
    });

    if (isDocumentExist) {
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
      // TODO: Ask Aarti, why these are coming from the client, if they can be set it to default values at document creation time.
      supervisor_verification_status: body.supervisor_verification_status,
      squad_verification_status: body.squad_verification_status,
      final_verification_status: body.final_verification_status, // assuming this field should also be included
      document_reg_date: body.document_reg_date,
      document_renewal_date: body.document_renewal_date,
      total_no_of_page: body.total_no_of_page,
      authorised_persons: body.authorised_persons.map((person) => ({
        authorised_person_name: person.authorised_person_name,
        contact_number: person.contact_number,
        alternate_number: person.alternate_number || null, // default to null if not provided
        email: person.email,
        designation: person.designation,
      })),
      total_no_of_date: body.total_no_of_date,
      document_unique_id: body.document_unique_id,
      document_type: body.document_type,
      created_by: userId,
      updated_by: userId,
      branch: body.branch,
    };

    // const id = crypto.randomBytes(16).toString('hex')
    if (file) {
      documentData.image_pdf = `${process.env.FILE_ACCESS_PATH}${
        body.branch_name
      }/${body.document_reg_no}${path.extname(file.originalname)}`;
    }

    const newDocument = await documentModel.create(documentData);

    // Create activity entry after creating the document
    const documentUniqueId = newDocument.document_unique_id
      ? newDocument.document_unique_id
      : "not available";

    const activityData = {
      activity_title: "Document Created",
      activity_description: `Document ${newDocument.document_name} with registration number ${newDocument.document_reg_no} has been uploaded. Document Unique ID: ${documentUniqueId}`,
      activity_created_at: newDocument.createdAt,
      activity_created_by_id: userId,
      activity_created_by_type: userRole.name,
      activity_document_id: newDocument.id,
    };

    await activityModel.create(activityData);
    return res.send({ results: newDocument });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const approveDocument = catchAsync(async (req, res, next) => {
  try {
    const { documentId } = req.params; // Assuming documentId is passed in the request params
    const userId = req.user.id; // Fetch user ID
    const userRole = await roleModel.findByPk(req.user.roleId); // Fetch user role

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
    const userRole = await roleModel.findByPk(req.user.roleId); // Fetch user role

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
    const userRole = await roleModel.findByPk(user.roleId);

    let pendingDoc;
    let filter = {};

    if (user.roleId === 1) {
      // Admin
      filter.final_verification_status = 0;
    } else if (user.roleId === 3) {
      // Squad
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
      filter.squad_verification_status = 0;
    } else if (user.roleId === 2) {
      // Supervisor
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
      filter.supervisor_verification_status = 0;
    } else if (user.roleId === 4) {
      // User
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
      filter.final_verification_status = 0;
    } else if (user.roleId === 8) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.roleId === 9) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.roleId === 7) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.roleId === 6) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 0;
    } else if (user.roleId === 10) {
      // Branch Registrar
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
          status: true,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
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
    const userRole = await roleModel.findByPk(user.roleId);

    let rejectedDoc;
    let filter = {};

    if (user.roleId === 1) {
      // Admin
      filter.final_verification_status = 0;
    } else if (user.roleId === 3) {
      // Squad
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
      filter.squad_verification_status = 2;
    } else if (user.roleId === 2) {
      // Supervisor
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
      filter.supervisor_verification_status = 2;
    } else if (user.roleId === 4) {
      // User
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
      filter[Op.or] = {
        supervisor_verification_status: 2,
        squad_verification_status: 2,
      };
    } else if (user.roleId === 8) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.roleId === 9) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.roleId === 7) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.roleId === 6) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
      filter.final_verification_status = 2;
    } else if (user.roleId === 10) {
      // Branch Registrar
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
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

    // Find the document created by the user
    const document = await documentModel.findOne({
      where: {
        created_by: userId,
        id: documentId,
      },
    });

    const branch = await branchModel.findByPk(document.branch);
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
    let documentFileUrl;
    if (req.file) {
      // documentFileUrl = `${process.env.FILE_PATH}${req.file.originalname}`;
      documentFileUrl = `${process.env.FILE_ACCESS_PATH}${body.branch_name}/${
        body.document_reg_no
      }${path.extname(file.originalname)}`;
    }

    // Update document data
    const documentData = {
      ...updatedData,
      supervisor_verification_status: 0, // Reseting to make it as a fresh verification
      squad_verification_status: 0, // Reseting to make it as a fresh verification
      final_verification_status: 0, // Reseting to make it as a fresh verification
    };
    if (documentFileUrl) {
      documentData.image_pdf = documentFileUrl;
    }

    // Update the document in the database
    const rowsUpdated = await documentModel.update(documentData, {
      where: {
        created_by: userId,
        id: documentId,
      },
    });

    // If no rows were updated, return error
    if (rowsUpdated[0] === 0) {
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Document with id ${documentId} doesn't exist or no changes were made`
        )
      );
    }

    // Fetch the updated document
    const updatedDocument = await documentModel.findOne({
      where: {
        created_by: userId,
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
    if (req.user.roleId === 8) {
      // RCS
      const userStateId = req.user.assignedStateId;
      const userDivisions = await db.Division.findAll({
        where: {
          stateId: userStateId,
        },
        attributes: ["id"],
      });
      const userDistricts = await db.District.findAll({
        where: {
          divisionId: userDivisions.map((division) => division.id),
        },
        attributes: ["id"],
      });
      const userTaluks = await db.Taluk.findAll({
        where: {
          districtId: userDistricts.map((district) => district.id),
        },
        attributes: ["id"],
      });
      const userBranches = await db.Branch.findAll({
        where: {
          talukId: userTaluks.map((taluk) => taluk.id),
        },
        attributes: ["id"],
      });
      where = {
        ...where,
        branch: userBranches.map((branch) => branch.id),
      };
    } else if (req.user.roleId === 9) {
      // ARCS
      const userCreatedDRs = await db.User.findAll({
        where: {
          created_by: req.user.id,
        },
        attributes: ["id"],
      });
      const userCreatedARs = await db.User.findAll({
        where: {
          created_by: userCreatedDRs.map((dr) => dr.id),
        },
        attributes: ["id"],
      });
      const userBranches = await db.User.findAll({
        where: {
          created_by: userCreatedARs.map((ar) => ar.id),
        },
        attributes: ["branch"],
      });
      where = {
        ...where,
        branch: userBranches.map((branch) => branch.id),
      };
    } else if (req.user.roleId === 7) {
      // Deputy Registrar
      const userCreatedARs = await db.User.findAll({
        where: {
          created_by: req.user.id,
        },
        attributes: ["id"],
      });
      const userBranches = await db.User.findAll({
        where: {
          created_by: userCreatedARs.map((ar) => ar.id),
        },
        attributes: ["branch"],
      });
      where = {
        ...where,
        branch: userBranches.map((branch) => branch.id),
      };
    } else if (req.user.roleId === 6) {
      // Assistant Registrar
      const userBranches = await db.User.findAll({
        where: {
          created_by: req.user.id,
        },
        attributes: ["branch"],
      });
      where = {
        ...where,
        branch: userBranches.map((branch) => branch.id),
      };
    } else if (req.user.roleId === 10) {
      // Branch Registrar
      where = {
        ...where,
        branch: req.user.branch,
      };
    } else {
      // return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized role'));
    }

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
    responseData.uploadsByDateAndType = uploadsByDateAndType.map((upload) => {
      const documentTypeName = documentTypeNames.find((type) => {
        return parseInt(type.id, 10) === parseInt(upload.document_type, 10);
      });
      return {
        ...upload.toJSON(),
        document_type_name: documentTypeName ? documentTypeName.name : null,
      };
    });
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
    const userRole = await roleModel.findByPk(user.roleId);

    let docList;
    let filter = {};

    if (user.roleId === 1) {
      // Admin
    } else if (user.roleId === 3) {
      // Squad
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
    } else if (user.roleId === 2) {
      // Supervisor
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
    } else if (user.roleId === 4) {
      // User
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
    } else if (user.roleId === 8) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
    } else if (user.roleId === 9) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
    } else if (user.roleId === 7) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
    } else if (user.roleId === 6) {
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
      filter.branch = _userBranches.map((branch) => branch.id);
    } else if (user.roleId === 10) {
      // Branch Registrar
      const _userBranches = await userStateToBranchModel.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["branch_id"],
      });
      filter.branch = _userBranches.map((branch) => branch.branch_id);
    }

    docList = await documentModel.findAll({ where: filter });

    return res.send({ status: true, data: docList });
  } catch (error) {
    console.error(error.toString());
    return res.status(500).send({ error: "Internal Server Error" });
  }
});
