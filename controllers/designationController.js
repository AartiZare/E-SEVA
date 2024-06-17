import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const Designation = db.Designation;

export const createDesignation = catchAsync(async (req, res) => {
  const designation = await Designation.create(req.body);
  res.status(httpStatus.CREATED).send(designation);
});

export const getDesignations = catchAsync(async (req, res) => {
  const designations = await Designation.findAll();
  res.status(httpStatus.OK).send(designations);
});

export const getDesignationById = catchAsync(async (req, res) => {
  const designation = await Designation.findByPk(req.params.id);
  if (!designation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Designation not found");
  }
  res.status(httpStatus.OK).send(designation);
});

export const updateDesignation = catchAsync(async (req, res) => {
  const designation = await Designation.findByPk(req.params.id);
  if (!designation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Designation not found");
  }
  Object.assign(designation, req.body);
  await designation.save();
  res.status(httpStatus.OK).send(designation);
});

export const deleteDesignation = catchAsync(async (req, res) => {
  const designation = await Designation.findByPk(req.params.id);
  if (!designation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Designation not found");
  }
  await designation.destroy();
  res.status(httpStatus.NO_CONTENT).send();
});
