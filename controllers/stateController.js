import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const State = db.State;

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

export const deleteState = catchAsync(async (req, res) => {
  const state = await State.findByPk(req.params.id);
  if (!state) {
    throw new ApiError(httpStatus.NOT_FOUND, "State not found");
  }
  await state.destroy();
  res.status(httpStatus.NO_CONTENT).send();
});
