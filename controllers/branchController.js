import { Op, where } from "sequelize";
import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const branchModel = db.Branch;
const userModel = db.User;
const userStateToBranchModel = db.UserStateToBranch;
const talukModel = db.Taluk;
const divisionModel = db.Division;
const districtModel = db.District;

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
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Branch with name ${body.name} already exists!`
        )
      );
    }

    const branchToBeCreated = {
      ...body,
      created_by: req.user.id,
      status: true,
    };

    // Create new branch
    const newBranch = await branchModel.create(branchToBeCreated);

    return res.send({ results: newBranch });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

export const getAllBranches = catchAsync(async (req, res, next) => {
  try {
    const { qFilter } = req.query;

    let filter = {};

    if (qFilter) {
      filter = JSON.parse(qFilter);
    }

    const { state_id, division_id, district_id, taluk_id } = filter;

    let branches = await branchModel.findAll();

    // Step 2: Filter by taluk_id if provided
    if (taluk_id) {
      branches = branches.filter(branch => branch.taluk_id === parseInt(taluk_id));
    }

    // Step 3: Filter by district_id if provided
    if (district_id) {
      const taluks = await talukModel.findAll({
        where: { district_id },
      });
      const talukIds = taluks.map(taluk => taluk.id);
      branches = branches.filter(branch => talukIds.includes(branch.taluk_id));
    }

    // Step 4: Filter by division_id if provided
    if (division_id) {
      const districts = await districtModel.findAll({
        where: { division_id },
      });
      const districtIds = districts.map(district => district.id);
      const taluks = await talukModel.findAll({
        where: { district_id: { [Op.in]: districtIds } },
      });
      const talukIds = taluks.map(taluk => taluk.id);
      branches = branches.filter(branch => talukIds.includes(branch.taluk_id));
    }

    // Step 5: Filter by state_id if provided
    if (state_id) {
      const divisions = await divisionModel.findAll({
        where: { state_id },
      });
      const divisionIds = divisions.map(division => division.id);
      const districts = await districtModel.findAll({
        where: { division_id: { [Op.in]: divisionIds } },
      });
      const districtIds = districts.map(district => district.id);
      const taluks = await talukModel.findAll({
        where: { district_id: { [Op.in]: districtIds } },
      });
      const talukIds = taluks.map(taluk => taluk.id);
      branches = branches.filter(branch => talukIds.includes(branch.taluk_id));
    }

    // Fetch district information for each branch
    const talukIds = branches.map(branch => branch.taluk_id);
    const taluks = await talukModel.findAll({
      where: { id: { [Op.in]: talukIds } },
    });
    const districtIds = taluks.map(taluk => taluk.district_id);
    const districts = await districtModel.findAll({
      where: { id: { [Op.in]: districtIds } },
    });

    // Map district information to branches
    const districtMap = districts.reduce((map, district) => {
      map[district.id] = district.name;
      return map;
    }, {});

    branches = branches.map(branch => {
      const taluk = taluks.find(taluk => taluk.id === branch.taluk_id);
      return {
        ...branch.get(),
        district: {
          id: taluk.district_id,
          name: districtMap[taluk.district_id],
        },
      };
    });

    return res.send(branches);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

// TODO: Bapu check where its being used in frontend both mobile and webapp
export const assignBranchToUser = catchAsync(async (req, res, next) => {
  let { userId } = req.query;
  let { branchId } = req.body;

  const parsedUserId = parseInt(userId);
  const branchIds = branchId.split(",").map((id) => parseInt(id));

  if (!parsedUserId || branchIds.includes(NaN)) {
    return res.status(400).send({
      data: { userId: parsedUserId, branchId: branchIds },
      status: "fail",
      message: "userId and branchId are required and should be numbers.",
    });
  }

  try {
    // Find the user
    const user = await userModel.findByPk(parsedUserId);
    if (!user) {
      return next(new ApiError(httpStatus.NOT_FOUND, "User not found"));
    }

    // Find the branches
    const branches = await branchModel.findAll({
      where: {
        id: branchIds,
      },
    });

    if (branches.length !== branchIds.length) {
      const foundBranchIds = branches.map((branch) => branch.id);
      const notFoundBranchIds = branchIds.filter(
        (id) => !foundBranchIds.includes(id)
      );
      return next(
        new ApiError(
          httpStatus.NOT_FOUND,
          `Branches not found for IDs: ${notFoundBranchIds.join(", ")}`
        )
      );
    }

    // Check if the userBranch entries already exist
    const existingUserBranchEntries = await userBranchModel.findAll({
      where: {
        userId: parsedUserId,
        branchId: branchIds,
      },
    });

    if (existingUserBranchEntries.length > 0) {
      const existingBranchIds = existingUserBranchEntries.map(
        (entry) => entry.branchId
      );
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `User is already assigned to branches with IDs: ${existingBranchIds.join(
            ", "
          )}`
        )
      );
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
    branchIds.forEach((branchId) => {
      if (!userBranches.includes(branchId)) {
        userBranches.push(branchId);
      }
    });

    await userModel.update(
      { branch: userBranches },
      { where: { id: parsedUserId } }
    );

    res.status(200).send({
      data: userBranchData,
      message: "Branches assigned to user successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error.message });
  }
});

export const listBranchesByUser = catchAsync(async (req, res, next) => {
  try {
    const userBranches = await userStateToBranchModel.findAll({
      where: {
        user_id: req.user.id,
      },
      attributes: ["branch_id"],
    });

    const withBranches = await branchModel.findAll({
      where: {
        id: userBranches.map((branch) => branch.branch_id),
      },
    });

    return res.send({ results: withBranches });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error.message });
  }
});

export const deleteBranch = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await branchModel.update(
      { is_deleted: true },
      {
        where: {
          id,
          is_deleted: false,
        },
      }
    );

    if (updatedRowsCount === 0) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Branch not found or already deleted"));
    }

    return res.status(httpStatus.OK).send({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));
  }
});
