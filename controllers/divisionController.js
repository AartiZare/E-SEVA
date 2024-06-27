import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const divisionModel = db.Division;
import logger from '../loggers.js';

export const createDivision = catchAsync(async (req, res) => {
  const division = await divisionModel.create(req.body);
  res.status(httpStatus.CREATED).send(division);
});

export const getDivision = catchAsync(async (req, res) => {
  const divisions = await divisionModel.findAll();
  res.status(httpStatus.OK).send(divisions);
});

export const getDivisionById = catchAsync(async (req, res) => {
  const division = await divisionModel.findByPk(req.params.id);
  if (!division) {
    throw new ApiError(httpStatus.NOT_FOUND, "Division not found");
  }
  res.status(httpStatus.OK).send(division);
});

export const updateDivision = catchAsync(async (req, res) => {
  const division = await divisionModel.findByPk(req.params.id);
  if (!division) {
    throw new ApiError(httpStatus.NOT_FOUND, "Division not found");
  }
  Object.assign(division, req.body);
  await division.save();
  res.status(httpStatus.OK).send(division);
});

export const deleteDivision = catchAsync(async (req, res, next) => {
  try {
    const division = await divisionModel.findOne({
      where: {
        id: req.params.id,
        is_deleted: false
      }
    });
    
    if (!division) {
      logger.info(`Division with ID ${req.params.id} not exist!`);
      return next(new ApiError(httpStatus.BAD_REQUEST, `Division with ID ${req.params.id} does not exist or deleted already!`));
    }

    division.is_deleted = true;
    await division.save();
    logger.info(`Division with ID ${division.id} deleted successfully`);
    return res.send({
      status: true,
      message: "Division deleted successfully",
      division,
    });
  } catch (error) {
    logger.error('Error deleting division:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal Server Error' });
  }
});

export const getDivisionByStateId = catchAsync(async (req, res) => {
  const stateId = req.params.stateId;
  const division = await divisionModel.findAll({
    where: { state_id: stateId },
  });

  if (!division) {
    throw new ApiError(httpStatus.NOT_FOUND, "Division not found");
  }
  res.status(httpStatus.OK).send(division);
});

