import { catchAsync } from "../utils/catchAsync.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import db from "../models/index.js";
const Taluk = db.Taluk;
import logger from '../loggers.js';

export const createTaluk = catchAsync(async (req, res) => {
  const taluk = await Taluk.create(req.body);
  res.status(httpStatus.CREATED).send(taluk);
});

export const getTaluks = catchAsync(async (req, res) => {
  const taluks = await Taluk.findAll({
    where: {
      is_deleted: false
    }
  });
  res.status(httpStatus.OK).send(taluks);
});

export const getTalukById = catchAsync(async (req, res) => {
  const taluk = await Taluk.findByPk(req.params.id);
  if (!taluk) {
    throw new ApiError(httpStatus.NOT_FOUND, "Taluk not found");
  }
  res.status(httpStatus.OK).send(taluk);
});

export const updateTaluk = catchAsync(async (req, res) => {
  const taluk = await Taluk.findByPk(req.params.id);
  if (!taluk) {
    throw new ApiError(httpStatus.NOT_FOUND, "Taluk not found");
  }
  Object.assign(taluk, req.body);
  await taluk.save();
  res.status(httpStatus.OK).send(taluk);
});

export const deleteTaluk = catchAsync(async (req, res, next) => {
  try {
    const taluk = await Taluk.findOne({
      where: {
        id: req.params.id,
        is_deleted: false
      }
    });

    if (!taluk) {
      logger.info(`Taluk with ID ${req.params.id} does not exist or is already deleted!`);
      return next(new ApiError(httpStatus.BAD_REQUEST, `Taluk with ID ${req.params.id} does not exist or is already deleted!`));
    }

    taluk.is_deleted = true;
    await taluk.save();

    logger.info(`Taluk with ID ${taluk.id} deleted successfully`);
    return res.send({
      status: true,
      message: "Taluk deleted successfully",
      taluk,
    });
  } catch (error) {
    logger.error('Error deleting taluk:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Internal Server Error' });
  }
});

export const getTalukByDisctrictId = catchAsync(async (req, res) => {
  const districtId = req.params.districtId;
  const taluks = await Taluk.findAll({ 
    where: {
       district_id: districtId,
       is_deleted: false
    } 
  });

  if (!taluks) {
    throw new ApiError(httpStatus.NOT_FOUND, "Taluk not found");
  }
  res.status(httpStatus.OK).send(taluks);
});
