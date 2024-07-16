import Joi from "joi";

export const createUser = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().required(),
    contact_number: Joi.string().required(),
    alternate_contact_number: Joi.string().allow(null, ""),
    pan_number: Joi.string().allow(null, ""),
    aadhaar_number: Joi.string().allow(null, ""),
    qualification: Joi.string().allow(null, ""),
    date_of_birth: Joi.date().allow(null, ""),
    pincode: Joi.string().allow(null, ""),
    district: Joi.string().allow(null, ""),
    taluk: Joi.string().allow(null, ""),
    village: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    bank_account_number: Joi.string().allow(null, ""),
    password: Joi.string().allow(null, ""),
    bank_ifsc: Joi.string().allow(null, ""),
    bank_name: Joi.string().allow(null, ""),
    role_id: Joi.number().integer().required(),
    bank_branch: Joi.array().items(Joi.number()).allow(null, ""),
    created_by: Joi.number().integer().allow(null, ""),
    status: Joi.boolean().allow(null, ""),
    vendor_id: Joi.allow(null, ""),

    // Other model fields
    state_id: Joi.allow(null, ""),
    division_id: Joi.allow(null, ""),
    district_id: Joi.allow(null, ""),
    taluk_id: Joi.allow(null, ""),
    branch_id: Joi.allow(null, ""),
  }),
  file: Joi.object().keys({
    profile_image: Joi.string().allow(null, ""),
  }),
};

export const updateUser = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object({
    full_name: Joi.string().allow(""),
    email: Joi.string().allow(""),
    contact_number: Joi.string().required(),
    alternate_contact_number: Joi.string().allow(""),
    pan_number: Joi.string().allow(""),
    aadhaar_number: Joi.string().allow(""),
    qualification: Joi.string().allow(""),
    date_of_birth: Joi.date().allow(""),
    pincode: Joi.string().allow(""),
    district: Joi.string().allow(""),
    taluk: Joi.string().allow(""),
    village: Joi.string().allow(""),
    address: Joi.string().allow(""),
    bank_account_number: Joi.string().allow(""),
    password: Joi.string().allow(""),
    bank_ifsc: Joi.string().allow(""),
    bank_name: Joi.string().allow(""),
    role_id: Joi.number().integer().allow(null),
    bank_branch: Joi.string().allow(""),

    // Other model fields
    state_id: Joi.allow(""),
    division_id: Joi.allow(""),
    district_id: Joi.allow(""),
    taluk_id: Joi.allow(""),
    branch_id: Joi.allow(""),
  }),
  file: Joi.object().keys({
    profile_image: Joi.string().allow(""),
  }),
};

export const getOneUser = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

export const deleteUser = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

export const getAllUsers = {
  query: Joi.object()
    .keys({
      page: Joi.number().integer(),
      limit: Joi.number().integer().default(10),
      sort: Joi.string().allow(""),
      search: Joi.string().allow(""),
    })
    .unknown(true),
};

export const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const getUserListByProjectId = {
  params: Joi.object().keys({
    projectId: Joi.number().integer().required(),
  }),
};
