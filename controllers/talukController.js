import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import db from '../models/index.js';
const Taluk = db.Taluk;

export const createTaluk = catchAsync(async (req, res) => {
    const taluk = await Taluk.create(req.body);
    res.status(httpStatus.CREATED).send(taluk);
});

export const getTaluks = catchAsync(async (req, res) => {
    const taluks = await Taluk.findAll();
    res.status(httpStatus.OK).send(taluks);
});

export const getTalukById = catchAsync(async (req, res) => {
    const taluk = await Taluk.findByPk(req.params.id);
    if (!taluk) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Taluk not found');
    }
    res.status(httpStatus.OK).send(taluk);
});

export const updateTaluk = catchAsync(async (req, res) => {
    const taluk = await Taluk.findByPk(req.params.id);
    if (!taluk) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Taluk not found');
    }
    Object.assign(taluk, req.body);
    await taluk.save();
    res.status(httpStatus.OK).send(taluk);
});

export const deleteTaluk = catchAsync(async (req, res) => {
    const taluk = await Taluk.findByPk(req.params.id);
    if (!taluk) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Taluk not found');
    }
    await taluk.destroy();
    res.status(httpStatus.NO_CONTENT).send();
});

export const getTalukByDisctrictId = catchAsync(async (req, res) => {
    const districtId = req.params.districtId;
    const taluks = await Taluk.findAll({where: {districtId: districtId}});

    if (!taluks) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Taluk not found');
    }
    res.status(httpStatus.OK).send(taluks);
});