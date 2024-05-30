import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const branchModel = db.Branch;

export const createBranch = catchAsync(async (req, res, next) => {
  try {
    const { body } = req;

    const isBranchExist = await branchModel.findOne({
      where: {
        [Op.and]: [{ name: body.name }],
      },
    });

    if (isBranchExist) {
      return next(new ApiError(httpStatus.BAD_REQUEST, `Branch with name ${body.name} already exists!`));
    }

    const branchToBeCreated = {
      name: body.name,
      address: body.address,
      status: body.status,
    };

    const newBranch = await branchModel.create(branchToBeCreated);
    return res.send({ results: newBranch });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

export const getAllBranches = catchAsync(async (req, res, next) => {
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
      where: filter,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    const branches = await branchModel.findAll(query);
    return res.send(branches);
  } catch(error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});
