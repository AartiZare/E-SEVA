import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const District = db.District;

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
        throw new ApiError(httpStatus.NOT_FOUND, 'District not found');
    }
    res.status(httpStatus.OK).send(district);
});

export const updateDistrict = catchAsync(async (req, res) => {
    const district = await District.findByPk(req.params.id);
    if (!district) {
        throw new ApiError(httpStatus.NOT_FOUND, 'District not found');
    }
    Object.assign(district, req.body);
    await district.save();
    res.status(httpStatus.OK).send(district);
});

export const deleteDistrict = catchAsync(async (req, res) => {
    const district = await District.findByPk(req.params.id);
    if (!district) {
        throw new ApiError(httpStatus.NOT_FOUND, 'District not found');
    }
    await district.destroy();
    res.status(httpStatus.NO_CONTENT).send();
});

export const getDistrictByDivisionId = catchAsync(async (req, res) => {
    const divisionId = req.params.divisionId;
    const division = await District.findAll({where: {divisionId: divisionId}});

    if (!division) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Division not found');
    }
    res.status(httpStatus.OK).send(division);
});
