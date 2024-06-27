import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const State = db.State;
import logger from '../loggers.js';

export const createState = catchAsync(async (req, res) => {
  const state = await State.create(req.body);
  res.status(httpStatus.CREATED).send(state);
});

export const getState = catchAsync(async (req, res) => {
  const states = await State.findAll();
  res.status(httpStatus.OK).send(states);
});

export const getStateById = catchAsync(async (req, res) => {
  const state = await State.findByPk(req.params.id);
  if (!state) {
    throw new ApiError(httpStatus.NOT_FOUND, "State not found");
  }
  res.status(httpStatus.OK).send(state);
});

export const updateState = catchAsync(async (req, res) => {
  const state = await State.findByPk(req.params.id);
  if (!state) {
    throw new ApiError(httpStatus.NOT_FOUND, "State not found");
  }
  Object.assign(state, req.body);
  await state.save();
  res.status(httpStatus.OK).send(state);
});

export const deleteState = catchAsync(async (req, res, next) => {
  try {
    const state = await State.findOne({
      where: {
        id: req.params.id,
        is_deleted: false
      }
    });

    if (!state) {
      logger.info(`State with ID ${req.params.id} does not exist or is already deleted!`);
      return next(new ApiError(httpStatus.BAD_REQUEST, `State with ID ${req.params.id} does not exist or is already deleted!`));
    }

    state.is_deleted = true;
    await state.save();

    logger.info(`State with ID ${state.id} deleted successfully`);
    return res.send({
      status: true,
      message: "State deleted successfully",
      state,
    });
  } catch (error) {
    logger.error('Error deleting state:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal Server Error' });
  }
});

