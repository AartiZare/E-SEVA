import Joi from "joi";

export const createVendor = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    contact_number: Joi.string().required(),
    alternate_contact_number: Joi.string().allow(""),
    pan_number: Joi.string().allow(""),
    aadhaar_number: Joi.string().allow(""),
    qualification: Joi.string().allow(""),
    company_name: Joi.string().allow(""),
    pincode: Joi.string().allow(""),
    district: Joi.string().allow(""),
    taluk: Joi.string().allow(""),
    village: Joi.string().allow(""),
    address: Joi.string().allow(""),
    bank_account_number: Joi.string().allow(""),
    bank_branch: Joi.string().allow(""),
    password: Joi.string().allow(""),
    bank_ifsc: Joi.string().allow(""),
    bank_name: Joi.string().allow(""),
    role_id: Joi.number().integer().allow(""),
  }),
  file: Joi.object().keys({
    profile_image: Joi.string().allow(""),
  }),
};
