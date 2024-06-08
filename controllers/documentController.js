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
            approved_by_supervisor: body.approved_by_supervisor,
            approved_by_squad: body.approved_by_squad,
            is_document_approved: body.is_document_approved, // assuming this field should also be included
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
        };

        // const id = crypto.randomBytes(16).toString('hex')
        if (file) {
            documentData.image_pdf = `${process.env.FILE_ACCESS_PATH}${file.originalname}`;
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
            // Update approved_by_supervisor field to true
            document.approved_by_supervisor = true;
            activityDescription = 'approved by Supervisor';
        } else if (userRole.name === 'Squad') {
            // Update approved_by_squad field to true
            document.approved_by_squad = true;
            activityDescription = 'approved by Squad';
        } else {
            // If user role is neither supervisor nor squad, return unauthorized
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
        }

        // Save the updated document
        document.updated_by = userId;
        await document.save();

        // Check if both supervisor and squad have approved, then update is_document_approved to true
        if (document.approved_by_supervisor && document.approved_by_squad) {
            document.is_document_approved = true;
            await document.save();
        }

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
            // Update rejected_by_supervisor field to true
            document.rejected_by_supervisor = true;
            activityDescription = 'rejected by Supervisor';
        } else if (userRole.name === 'Squad') {
            // Update rejected_by_squad field to true
            document.rejected_by_squad = true;
            activityDescription = 'rejected by Squad';
        } else {
            // If user role is neither supervisor nor squad, return unauthorized
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
        }

        // Save the updated document
        document.updated_by = userId;

        // Set is_document_rejected to true if either supervisor or squad rejects the document
        if (document.rejected_by_supervisor || document.rejected_by_squad) {
            document.is_document_rejected = true;
        }

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
                    is_document_approved: false,
                    rejected_by_supervisor: false,
                    rejected_by_squad: false,
                    [Op.or]: [
                        { approved_by_supervisor: false },
                        { approved_by_squad: false }
                    ]
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
                    is_document_approved: false,
                    rejected_by_supervisor: false,
                    rejected_by_squad: false,
                    [Op.or]: [
                        { approved_by_supervisor: false },
                        { approved_by_squad: false }
                    ]
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
                    is_document_approved: false,
                    approved_by_supervisor: true,
                    rejected_by_supervisor: false,
                    rejected_by_squad: false
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
                    [Op.or]: [
                        { rejected_by_supervisor: true },
                        { rejected_by_squad: true }
                    ]
                }
            });
        } else if (userRole.name === 'Supervisor') {
            rejectedDoc = await documentModel.findAll({
                where: {
                    updated_by: user.id,
                    rejected_by_supervisor: true
                }
            });
        } else if (userRole.name === 'Squad') {
            rejectedDoc = await documentModel.findAll({
                where: {
                    updated_by: user.id,
                    rejected_by_squad: true
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

        // Find the document created by the user
        const document = await documentModel.findOne({
            where: {
                created_by: userId,
                id: documentId
            }
        });

        // If document not found, return error
        if (!document) {
            return next(new ApiError(httpStatus.NOT_FOUND, `Document with id ${documentId} not found`));
        }

        // Handle file upload if present
        let documentFileUrl;
        if (req.file) {
            documentFileUrl = `${process.env.FILE_PATH}${req.file.originalname}`;
        }

        // Update document data
        const documentData = { ...updatedData };
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

// export const getDocFileByDocId = catchAsync(async(req, res, next) => {
//     const documentId = req.params.documentId;
//     const document = await documentModel.findByPk(documentId);

//     console.log(document, "document")
//     res.sendFile(document.image_pdf);

    // res.sendFile(`C:\\Users\\INTEL\\Desktop\\E-SEVA\\E-SEVA\\public\\uploads\\dummy pdf.pdf`)
// });
export const getDocFileByDocId = catchAsync(async (req, res, next) => {
    try {
        const documentId = req.query.documentId;
        // const document = await documentModel.findByPk(documentId);

        // if (!document || !document.image_pdf) {
        //     return next(new ApiError(httpStatus.NOT_FOUND, 'Document or file not found'));
        // }

        // console.log(document.image_pdf, "pdf path")
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
