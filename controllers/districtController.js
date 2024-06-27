import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const District = db.District;
import logger from '../loggers.js';

export const createDistrict = catchAsync(async (req, res) => {
  const district = await District.create(req.body);
  res.status(httpStatus.CREATED).send(district);
});

export const getDistricts = catchAsync(async (req, res) => {
  const districts = await District.findAll();
  res.status(httpStatus.OK).send(districts);
});

export const getDistrictById = catchAsync(async (req, res) => {
  const district = await District.findByPk(req.params.id);
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, "District not found");
  }
  res.status(httpStatus.OK).send(district);
});

export const updateDistrict = catchAsync(async (req, res) => {
  const district = await District.findByPk(req.params.id);
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, "District not found");
  }
  Object.assign(district, req.body);
  await district.save();
  res.status(httpStatus.OK).send(district);
});

export const deleteDistrict = catchAsync(async (req, res, next) => {
  try {
    const district = await District.findOne({
      where: {
        id: req.params.id,
        is_deleted: false
      }
    });

    if (!district) {
      logger.info(`District with ID ${req.params.id} does not exist or is already deleted!`);
      return next(new ApiError(httpStatus.BAD_REQUEST, `District with ID ${req.params.id} does not exist or is already deleted!`));
    }

    district.is_deleted = true;
    await district.save();

    logger.info(`District with ID ${district.id} deleted successfully`);
    return res.send({
      status: true,
      message: "District deleted successfully",
      district,
    });
  } catch (error) {
    logger.error('Error deleting district:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal Server Error' });
  }
});

export const getDistrictByDivisionId = catchAsync(async (req, res) => {
  const divisionId = req.params.divisionId;
  const division = await District.findAll({
    where: { division_id: divisionId },
  });

  if (!division) {
    throw new ApiError(httpStatus.NOT_FOUND, "Division not found");
  }
  res.status(httpStatus.OK).send(division);
});
