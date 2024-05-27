import Joi from 'joi';

export const createBranch = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        address: Joi.string().optional(),
        status: Joi.boolean().optional()
    }),
};
