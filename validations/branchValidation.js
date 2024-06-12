// import Joi from 'joi';

// export const createBranch = {
//     body: Joi.object().keys({
//         name: Joi.string().required(),
//         address: Joi.string().optional(),
//         status: Joi.boolean().optional()
//     }),
// };


import Joi from 'joi';

export const createBranch = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        branch_code: Joi.string(),
        address: Joi.string().optional(),
        pincode: Joi.string().optional(),
        talukId: Joi.number().integer(),
        createdBy: Joi.number().integer(),
        status: Joi.boolean().optional()
    }),
};
