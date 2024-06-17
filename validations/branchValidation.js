import Joi from "joi";

export const createBranch = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    branch_code: Joi.string(),
    address: Joi.string().optional(),
    pincode: Joi.string().optional(),
    taluk_id: Joi.number().integer(),
    status: Joi.boolean().optional(),
  }),
};
