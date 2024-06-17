import { Op, where } from 'sequelize';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const branchModel = db.Branch;
const userModel = db.Users;
const userBranchModel = db.UserBranch;
const roleModel = db.Roles;
const userStateToBranchModel = db.UserStateToBranch;

export const createBranch = catchAsync(async (req, res, next) => {
  try {
    const { body } = req;

    // Check if branch already exists
    const isBranchExist = await branchModel.findOne({
      where: {
        [Op.and]: [{ name: body.name }],
      },
    });

    if (isBranchExist) {
      return next(new ApiError(httpStatus.BAD_REQUEST, `Branch with name ${body.name} already exists!`));
    }

    // Include all necessary fields
    const branchToBeCreated = {
      // name: body.name,
      // branch_code: body.branch_code,
      // address: body.address,
      // pincode: body.pincode,
      // stateId: body.stateId,
      // divisionId: body.divisionId,
      // districtId: body.districtId,
      // talukId: body.talukId,
      ...body, 
      createdBy: req.user.id,
      // status: body.status,
    };

    // Create new branch
    const newBranch = await branchModel.create(branchToBeCreated);

    return res.send({ results: newBranch });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

export const getAllBranches = catchAsync(async (req, res, next) => {
  try {
    const { qFilter, talukId } = req.query;
    let filter = {};

    if (qFilter) {
        filter = {
            ...JSON.parse(qFilter),
        };
    }

    if (talukId) {
        filter.talukId = talukId;
    }

    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;

    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (searchTerm !== '') {
          filter.name = {
              [Op.like]: `%${searchTerm}%`
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
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

export const assignBranchToUser = catchAsync(async (req, res, next) => {
  let { userId } = req.query;
  let { branchId } = req.body;

  console.log("userId", userId);
  console.log("branchId", branchId);

  const parsedUserId = parseInt(userId);
  const branchIds = branchId.split(',').map(id => parseInt(id));

  if (!parsedUserId || branchIds.includes(NaN)) {
    return res.status(400).send({
      data: { userId: parsedUserId, branchId: branchIds },
      status: 'fail',
      message: 'userId and branchId are required and should be numbers.',
    });
  }

  try {
    // Find the user
    const user = await userModel.findByPk(parsedUserId);
    if (!user) {
      return next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
    }

    // Find the branches
    const branches = await branchModel.findAll({
      where: {
        id: branchIds
      }
    });

    if (branches.length !== branchIds.length) {
      const foundBranchIds = branches.map(branch => branch.id);
      const notFoundBranchIds = branchIds.filter(id => !foundBranchIds.includes(id));
      return next(new ApiError(httpStatus.NOT_FOUND, `Branches not found for IDs: ${notFoundBranchIds.join(', ')}`));
    }

    // Check if the userBranch entries already exist
    const existingUserBranchEntries = await userBranchModel.findAll({
      where: {
        userId: parsedUserId,
        branchId: branchIds
      }
    });

    if (existingUserBranchEntries.length > 0) {
      const existingBranchIds = existingUserBranchEntries.map(entry => entry.branchId);
      return next(new ApiError(httpStatus.BAD_REQUEST, `User is already assigned to branches with IDs: ${existingBranchIds.join(', ')}`));
    }

    // Create new entries in userBranchModel
    const userBranchData = await Promise.all(
      branchIds.map(async (branchId) => {
        return await userBranchModel.create({
          userId: parsedUserId,
          branchId: branchId,
        });
      })
    );

    // Update the user's branch field
    const userBranches = user.branch ? user.branch : [];
    branchIds.forEach(branchId => {
      if (!userBranches.includes(branchId)) {
        userBranches.push(branchId);
      }
    });

    await userModel.update({ branch: userBranches }, { where: { id: parsedUserId } });

    res.status(200).send({ data: userBranchData, message: 'Branches assigned to user successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error.message });
  }
});


export const listBranchesByUser = catchAsync(async (req, res, next) => {
  try {
      const userBranches = await userStateToBranchModel.findAll({
          where: {
              user_id: req.user.id
          },
          attributes: ['branch_id']
      });

      const withBranches = await branchModel.findAll({
          where: {
              id: userBranches.map(branch => branch.branch_id)
          }
      });

      return res.send({ results: withBranches });
  } catch (error) {
      console.error(error);
      return res.status(500).send({ error: error.message });
  }
});
