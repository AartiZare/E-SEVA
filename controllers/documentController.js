import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
dotenv.config();
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const documentModel = db.Document;
const roleModel = db.Roles;
const activityModel = db.Activity;
const userModel = db.Users;
const branchModel = db.Branch;
 
export const createDocument = catchAsync(async (req, res, next) => {
    try {
        const { body, file } = req;
        const userId = req.user.id;

        console.log(userId, "user id")

        console.log("Document body", body);

        const userRole = await roleModel.findByPk(req.user.roleId);
        const isDocumentExist = await documentModel.findOne({
            where: {
                [Op.and]: [
                    { document_name: body.document_name },
                    { document_reg_no: body.document_reg_no }
                ],
            },
        });

        if (isDocumentExist) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `Document with name ${body.document_name} and registration number ${body.document_reg_no} already exists!`));
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
            authorised_persons: body.authorised_persons.map(person => ({
                authorised_person_name: person.authorised_person_name,
                contact_number: person.contact_number,
                alternate_number: person.alternate_number || null, // default to null if not provided
                email_id: person.email_id,
                designation: person.designation
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
            documentData.image_pdf = `${process.env.FILE_ACCESS_PATH}${body.branch_name}/${body.document_reg_no}${path.extname(file.originalname)}`;
        }

        const newDocument = await documentModel.create(documentData);

        // Create activity entry after creating the document
        const documentUniqueId = newDocument.document_unique_id ? newDocument.document_unique_id : 'not available';

        const activityData = {
            Activity_title: 'Document Created',
            activity_description: `Document ${newDocument.document_name} with registration number ${newDocument.document_reg_no} has been uploaded. Document Unique ID: ${documentUniqueId}`,
            activity_created_at: newDocument.createdAt,
            activity_created_by_id: userId,
            activity_created_by_type: userRole.name,
            activity_document_id: newDocument.id
        };
        
        await activityModel.create(activityData);
        return res.send({ results: newDocument });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
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
            return next(new ApiError(httpStatus.NOT_FOUND, 'Document not found'));
        }

        // Check if the logged-in user is authorized to approve the document
        let activityDescription = '';
        if (userRole.name === 'Supervisor') {
            // Update supervisor_verification_status for approved
            document.supervisor_verification_status = 1;
            activityDescription = 'approved by Supervisor';
        } else if (userRole.name === 'Squad') {
            // Update squad_verification_status for approved
            document.squad_verification_status = 1;
            document.final_verification_status = 1;
            activityDescription = 'approved by Squad';
        } else {
            // If user role is neither supervisor nor squad, return unauthorized
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
        }

        // Save the updated document
        document.updated_by = userId;
        await document.save();

        // Create activity entry after approving the document
        const activityData = {
            Activity_title: 'Document Approved',
            activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
            activity_created_at: document.updatedAt,
            activity_created_by_id: userId,
            activity_created_by_type: userRole.name,
            activity_document_id: document.id
        };

        await activityModel.create(activityData);

        return res.send({ status: true, data: document, message: 'Document approved successfully' });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
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
            return next(new ApiError(httpStatus.NOT_FOUND, 'Document not found'));
        }

        // Check if the logged-in user is authorized to reject the document
        let activityDescription = '';
        if (userRole.name === 'Supervisor') {
            // Update supervisor_verification_status for rejection
            document.supervisor_verification_status = 2;
            document.final_verification_status = 2;
            activityDescription = 'rejected by Supervisor';
        } else if (userRole.name === 'Squad') {
            // Update squad_verification_status for rejection
            document.squad_verification_status = 2;
            document.final_verification_status = 2;
            activityDescription = 'rejected by Squad';
        } else {
            // If user role is neither supervisor nor squad, return unauthorized
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
        }

        // Save the updated document
        document.updated_by = userId;

        await document.save();

        // Create activity entry after rejecting the document
        const activityData = {
            Activity_title: 'Document Rejected',
            activity_description: `Document ${document.document_name} with registration number ${document.document_reg_no} has been ${activityDescription}. Document Unique ID: ${document.document_unique_id}`,
            activity_created_at: document.updatedAt,
            activity_created_by_id: userId,
            activity_created_by_type: userRole.name,
            activity_document_id: document.id
        };

        await activityModel.create(activityData);

        return res.send({ status: true, data: document, message: 'Document rejected successfully' });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const pendingDocumentListUser = catchAsync(async (req, res, next) => {
    try {
        const user = req.user;
        const userRole = await roleModel.findByPk(user.roleId);

        let pendingDoc;

        if (userRole.name === 'User') {
            pendingDoc = await documentModel.findAll({
                where: {
                    created_by: user.id,
                    final_verification_status: 0,
                }
            });
        } else if (userRole.name === 'Supervisor') {
            // Find users created by the supervisor
            const supervisorCreatedUsers = await userModel.findAll({
                where: {
                    created_by: user.id
                },
                attributes: ['id']
            });

            const supervisorCreatedUserIds = supervisorCreatedUsers.map(u => u.id);

            pendingDoc = await documentModel.findAll({
                where: {
                    created_by: supervisorCreatedUserIds,
                    supervisor_verification_status: 0
                }
            });
        } else if (userRole.name === 'Squad') {
            // Find supervisors created by the squad
            const squadCreatedSupervisors = await userModel.findAll({
                where: {
                    created_by: user.id,
                    roleId: await roleModel.findOne({ where: { name: 'Supervisor' } }).then(role => role.id)
                },
                attributes: ['id']
            });

            const supervisorIds = squadCreatedSupervisors.map(supervisor => supervisor.id);

            // Find users created by these supervisors
            const supervisorCreatedUsers = await userModel.findAll({
                where: {
                    created_by: supervisorIds
                },
                attributes: ['id']
            });

            const supervisorCreatedUserIds = supervisorCreatedUsers.map(u => u.id);

            pendingDoc = await documentModel.findAll({
                where: {
                    created_by: supervisorCreatedUserIds,
                    squad_verification_status: 0
                }
            });

        } else {
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized role'));
        }

        return res.send({ status: true, data: pendingDoc });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const rejectedDocumentListUser = catchAsync(async (req, res, next) => {
    try {
        const user = req.user;
        const userRole = await roleModel.findByPk(user.roleId);

        let rejectedDoc;
        if (userRole.name === 'User') {
            rejectedDoc = await documentModel.findAll({
                where: {
                    created_by: user.id,
                    final_verification_status: 2
                }
            });
        } else if (userRole.name === 'Supervisor') {
            rejectedDoc = await documentModel.findAll({
                where: {
                    updated_by: user.id,
                    supervisor_verification_status: 2
                }
            });
        } else if (userRole.name === 'Squad') {
            rejectedDoc = await documentModel.findAll({
                where: {
                    updated_by: user.id,
                    squad_verification_status: 2
                }
            });
        } else {
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized role'));
        }

        return res.send({ status: true, data: rejectedDoc });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
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
                id: documentId
            }
        });

        const branch = await branchModel.findByPk(document.branch);
        // If document not found, return error
        if (!document) {
            return next(new ApiError(httpStatus.NOT_FOUND, `Document with id ${documentId} not found`));
        }
      
        // Handle file upload if present
        let documentFileUrl;
        if (req.file) {
            // documentFileUrl = `${process.env.FILE_PATH}${req.file.originalname}`;
            documentFileUrl = `${process.env.FILE_ACCESS_PATH}${branch.name}/${document.document_reg_no}${path.extname(file.originalname)}`;
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
                id: documentId
            }
        });

        // If no rows were updated, return error
        if (rowsUpdated[0] === 0) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `Document with id ${documentId} doesn't exist or no changes were made`));
        }

        // Fetch the updated document
        const updatedDocument = await documentModel.findOne({
            where: {
                created_by: userId,
                id: documentId
            }
        });

        // Send the updated document as response
        return res.send({ message: 'Document updated successfully', updatedDocument });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const getDocumentById = catchAsync(async (req, res, next) => {
    const documentId = req.params.documentId;
    const document = await documentModel.findByPk(documentId);
    if (!document) {
        return next(new ApiError(httpStatus.NOT_FOUND, `Document with id ${documentId} not found`));
    }
    return res.send({ msg: "Document fetched successfully", data: document });
});

export const getDocFileByDocId = catchAsync(async (req, res, next) => {
    try {
        const documentId = req.query.documentId;

        const filePath = path.join(`${process.env.FILE_PATH}`+documentId);

        console.log(filePath, "uploaded file");

        res.sendFile(filePath, (err) => {
            if (err) {
                next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error sending file'));
            }
        });
    } catch (error) {
        console.error(error.toString());
        return res.status(500).send({ error: 'Internal Server Error' });
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
            if (searchTerm !== '') {
                conditions.document_name = {
                    [Op.like]: `%${searchTerm}%`
                };
            }
        }

        if (from_date && to_date) {
            conditions.document_reg_date = {
                [Op.between]: [new Date(from_date), new Date(to_date)]
            };
        } else if (from_date) {
            conditions.document_reg_date = {
                [Op.gte]: new Date(from_date)
            };
        } else if (to_date) {
            conditions.document_reg_date = {
                [Op.lte]: new Date(to_date)
            };
        }

        if (document_type) {
            conditions.document_type = document_type;
        }

        const documents = await documentModel.findAll({
            where: {
                ...conditions,
                is_document_approved: true
            }
        });

        return res.send({
            results: documents,
            total: documents.length
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});
