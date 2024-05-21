import Joi from 'joi';

export const create = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        complete_access: Joi.boolean(),
        status: Joi.boolean()
    }),
};

export const getAllRoles = {
    params: Joi.object().keys({}),
    body: Joi.object().keys({}), 
    query: Joi.object().keys({
        page: Joi.number(),
        limit: Joi.number().default(10),
        sort: Joi.string(),
        search: Joi.string().allow(''),
    }).unknown(true),
};
