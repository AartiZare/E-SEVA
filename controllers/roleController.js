import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const roleModel = db.Roles;

export const create = catchAsync(async (req, res, next) => {
  try {
    const { body } = req;
   
    const isRoleExist = await roleModel.findOne({
      where: {
        [Op.and]: [{ name: body.name }],
      },
    });

    if (isRoleExist) {
      return next(new ApiError(httpStatus.BAD_REQUEST, `Role with name ${body.name} and already exists!`));
    }

    const roleToBeCreate = {
      name: body.name,
      status: body.status,
    //   created_by: req.user.id,
    //   updated_by: req.user.id,
    };

    const newRole = await roleModel.create(roleToBeCreate);
    return res.send({ results: newRole });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

export const getAllRole = catchAsync(async (req, res, next) => {
  try {
    const { qFilter } = req.query;
    let filter = {};
    if (qFilter) {
        filter = {
            ...JSON.parse(qFilter),
        };
    }
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (searchTerm !== '') {
          filter = {
              name: {
                  [Op.like]: `%${searchTerm}%`
              }
          };
      }
  }
  const query = {
      ...filter,
  };

  const roles = await roleModel.findAll(query, page, pageSize);
  return res.send(roles);
  } catch(error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
})