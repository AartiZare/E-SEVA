import Joi from 'joi';

export const createUser = {
  body: Joi.object({
    full_name: Joi.string().required(),
    email_id: Joi.string().email().required(),
    contact_no: Joi.string().required(),
    alt_contact_no: Joi.string().allow(''),
    pan_no: Joi.string().required(),
    adhar_no: Joi.string().required(),
    qualifications: Joi.string().allow(''),
    dob: Joi.date().required(),
    pincode: Joi.string().required(),
    district: Joi.string().required(),
    taluk: Joi.string().allow(''),
    village: Joi.string().allow(''),
    address: Joi.string().required(),
    account_no: Joi.string(),
    branch: Joi.array().items(Joi.number()).required(),
    password: Joi.string(),
    ifsc: Joi.string().required(),
    bank_name: Joi.string().required(),
    roleId: Joi.number().integer().required(),
    created_by: Joi.number().integer().required(),
    ifsc: Joi.string(),
    bank_name: Joi.string(),
    roleId: Joi.number().integer().required()
  }),
  file: Joi.object()
    .keys({
      profile_image: Joi.string().allow(''),
  }),
};


export const updateUser = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object({
        full_name: Joi.string().allow(''),
        email_id: Joi.string().email().allow(''),
        contact_no: Joi.string().allow(''),
        alt_contact_no: Joi.string().allow(''),
        pan_no: Joi.string().allow(''),
        adhar_no: Joi.string().allow(''),
        qualifications: Joi.string().allow(''),
        dob: Joi.date().allow(''),
        pincode: Joi.string().allow(''),
        district: Joi.string().allow(''),
        taluk: Joi.string().allow(''),
        village: Joi.string().allow(''),
        address: Joi.string().allow(''),
        account_no: Joi.string().allow(''),
        branch: Joi.string().allow(''),
        password: Joi.string().allow(''),
        ifsc: Joi.string().allow(''),
        bank_name: Joi.string().allow(''),
        roleId: Joi.number().integer().allow(null)
    }), 
    file: Joi.object()
    .keys({
      profile_image: Joi.string().allow(''),
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
    query: Joi.object().keys({
        page: Joi.number().integer(),
        limit: Joi.number().integer().default(10),
        sort: Joi.string().allow(''),
        search: Joi.string().allow(''),
    }).unknown(true),
};

export const login = {
    body: Joi.object().keys({
        email_id: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

export const getUserListByProjectId = {
    params: Joi.object().keys({
        projectId: Joi.number().integer().required(),
    }),
};
