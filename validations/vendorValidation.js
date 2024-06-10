import Joi from 'joi';

export const createVendor = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email_id: Joi.string().email().required(),
    contact_no: Joi.string().required(),
    alt_contact_no: Joi.string().allow(''),
    pan_no: Joi.string().required(),
    adhar_no: Joi.string().required(),
    qualifications: Joi.string().allow(''),
    company_name: Joi.string().allow(''),
    pincode: Joi.string().required(),
    district: Joi.string().required(),
    taluk: Joi.string().allow(''),
    village: Joi.string().allow(''),
    address: Joi.string().required(),
    account_no: Joi.string().required(),
    branch: Joi.string().required(),
    password: Joi.string(),
    ifsc: Joi.string().required(),
    bank_name: Joi.string().required(),
    roleId: Joi.number().integer().required()
  }),
  file: Joi.object()
    .keys({
      profile_image: Joi.string().allow(''),
  }),
};
