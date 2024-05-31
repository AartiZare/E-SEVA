import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const documentModel = db.Document;
const roleModel = db.Roles;
const activityModel = db.Activity;

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
            created_by: userId,
            updated_by: userId
        };

        if (file) {
            documentData.image_pdf = `http://52.66.238.70/E-Seva/uploads/${file.originalname}`;
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

export const pendingDocumentListUser = catchAsync(async (req, res, next) => {
    try {
        const user = req.user;
        const userRole = await roleModel.findByPk(user.roleId);

        let pendingDoc;
        if (userRole.name === 'User' || userRole.name === 'Supervisor') {
            pendingDoc = await documentModel.findAll({
                where: {
                    created_by: user.id,
                    [Op.or]: [
                        { is_document_approved: false },
                        { approved_by_supervisor: false },
                        { approved_by_squad: false }
                    ]
                }
            });
        } else if (userRole.name === 'Squad') {
            pendingDoc = await documentModel.findAll({
                where: {
                    created_by: user.id,
                    is_document_approved: false,
                    approved_by_supervisor: true
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
