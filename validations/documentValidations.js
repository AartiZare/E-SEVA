import Joi from 'joi';

export const createDocument = {
    body: Joi.object().keys({
        document_name: Joi.string().required(),
        document_reg_no: Joi.string().required(),
        document_type: Joi.string().allow(null, ''),
        branch: Joi.number().integer().allow(null),
        branch_name: Joi.string(),
        approved_by_supervisor: Joi.boolean().default(false),
        approved_by_squad: Joi.boolean().default(false),
        rejected_by_supervisor: Joi.boolean().default(false),
        rejected_by_squad: Joi.boolean().default(false),
        is_document_approved: Joi.boolean().default(false),
        is_document_rejected: Joi.boolean().default(false),
        document_reg_date: Joi.date().required(),
        document_renewal_date: Joi.date().required(),
        total_no_of_page: Joi.number().integer(),
        authorised_persons: Joi.array().items(
            Joi.object({
                authorised_person_name: Joi.string().required(),
                contact_number: Joi.string().required(),
                alternate_number: Joi.string().allow(null, ''),
                email_id: Joi.string().email().required(),
                designation: Joi.string().required(),
            })
        ).required(),
        document_unique_id: Joi.string().allow(null, ''),
        // created_by and updated_by are not included here as they are set automatically based on the authenticated user
        supervisor_verification_status: Joi.number().default(0),
        squad_verification_status: Joi.number().default(0),
        final_verification_status: Joi.number().default(0),
    }),
    file: Joi.object().keys({
        image_pdf: Joi.string().allow('')
    })
};
