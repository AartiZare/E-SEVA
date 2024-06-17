import db from "../models/index.js";
import { catchAsync } from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";
const DocumentType = db.DocumentType;

export const createDocumentType = catchAsync(async (req, res) => {
  const { name, description, status } = req.body;
  const documentType = await DocumentType.create({ name, description, status });
  res.status(httpStatus.CREATED).send({ data: documentType });
});

export const getDocumentTypes = catchAsync(async (req, res) => {
  const documentTypes = await DocumentType.findAll();
  res.status(httpStatus.OK).send({ data: documentTypes });
});

export const getDocumentTypeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const documentType = await DocumentType.findByPk(id);
  if (!documentType) {
    return next(new ApiError(httpStatus.NOT_FOUND, "Document type not found"));
  }
  res.status(httpStatus.OK).send({ data: documentType });
});

export const updateDocumentType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const documentType = await DocumentType.findByPk(id);
  if (!documentType) {
    return next(new ApiError(httpStatus.NOT_FOUND, "Document type not found"));
  }
  await documentType.update({ name, description, status });
  res.status(httpStatus.OK).send({ data: documentType });
});

export const deleteDocumentType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const documentType = await DocumentType.findByPk(id);
  if (!documentType) {
    return next(new ApiError(httpStatus.NOT_FOUND, "Document type not found"));
  }
  await documentType.destroy();
  res.status(httpStatus.NO_CONTENT).send();
});
