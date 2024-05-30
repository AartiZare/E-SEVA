import { Op, where } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const branchModel = db.Branch;
const userModel = db.Users;
const userBranchModel = db.UserBranch;

//create a branch for the user
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
  }
   catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

//get all the branches for a user
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

//assign a branch to a user
export const assignBranchToUser = catchAsync(async (req, res, next) => {
  let { userId, branchId } = req.query;

  userId = parseInt(userId);
  branchId = parseInt(branchId);

  if (!userId || !branchId) {
    return res.status(400).send({
      data : {userId: userId, branchId: branchId},
      status: 'fail',
      message: 'userId and branchId are required.',
    });
  }

  try {
    // Find the user
    const user = await userModel.findByPk(userId);
    if (!user) {
      return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
    }

    // Find the branch
    const branch = await branchModel.findByPk(branchId);
    if (!branch) {
      return next(new ApiError(httpStatus.NOT_FOUND, 'Branch not found'));
    }

    // Check if the userBranch entry already exists
    const userBranchEntry = await userBranchModel.findOne({
      where: {
        userId,
        branchId,
      },
    });

    if (userBranchEntry) {
      return next(new ApiError(httpStatus.BAD_REQUEST, 'User is already assigned to this branch'));
    }

    // Create a new entry in userBranchModel
    const uesrBranchdata = await userBranchModel.create({
      userId,
      branchId,
    });

    // Update the user's branch field
    const userBranches = user.branch ? user.branch : [];
    if (!userBranches.includes(branchId)) {
      userBranches.push( branchId );
    }    

    await userModel.update({ branch: userBranches }, {where: { id: userId }});

    res.status(200).send({ data: uesrBranchdata, message: 'Branch assigned to user successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

