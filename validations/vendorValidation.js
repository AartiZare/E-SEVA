import Joi from "joi";

export const createVendor = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    contact_number: Joi.string().required(),
    alternate_contact_number: Joi.string().allow(""),
    pan_number: Joi.string().required(),
    aadhaar_number: Joi.string().required(),
    qualification: Joi.string().allow(""),
    company_name: Joi.string().allow(""),
    pincode: Joi.string().required(),
    district: Joi.string().required(),
    taluk: Joi.string().allow(""),
    village: Joi.string().allow(""),
    address: Joi.string().required(),
    bank_account_number: Joi.string().required(),
    bank_branch: Joi.string().required(),
    password: Joi.string(),
    bank_ifsc: Joi.string().required(),
    bank_name: Joi.string().required(),
    role_id: Joi.number().integer().required(),
  }),
  file: Joi.object().keys({
    profile_image: Joi.string().allow(""),
  }),
};
