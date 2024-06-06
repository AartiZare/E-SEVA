
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const divisionModel = db.Division;

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
        throw new ApiError(httpStatus.NOT_FOUND, 'Division not found');
    }
    res.status(httpStatus.OK).send(division);
});

export const updateDivision = catchAsync(async (req, res) => {
    const division = await divisionModel.findByPk(req.params.id);
    if (!division) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Division not found');
    }
    Object.assign(division, req.body);
    await division.save();
    res.status(httpStatus.OK).send(division);
});

export const deleteDivision = catchAsync(async (req, res) => {
    const division = await divisionModel.findByPk(req.params.id);
    if (!division) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Division not found');
    }
    await divisionModel.destroy();
    res.status(httpStatus.NO_CONTENT).send();
});

export const getDivisionByStateId = catchAsync(async (req, res) => {
    const stateId = req.params.stateId;
    const division = await divisionModel.findAll({where: {stateId: stateId}});

    if (!division) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Division not found');
    }
    res.status(httpStatus.OK).send(division);
});