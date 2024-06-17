import db from "../models/index.js";
const userModel = db.User;

export async function createUser(body, options) {
  return userModel.create(body, options);
}
export async function updateOneUser(id, updatedData) {
  const [rowsUpdated] = await userModel.update(updatedData, {
    where: { id: id },
  });
  const updatedUsers = await userModel.findByPk(id);
  return [rowsUpdated, updatedUsers];
}
export async function deleteUser(id) {
  return await userModel.destroy({ where: { id: id } });
}
export async function getById(id) {
  return await userModel.findByPk(id);
}
export const getAll = async (query, page, pageSize, order) => {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await userModel.findAndCountAll({
    where: query,
    limit: pageSize,
    offset: offset,
    order: order,
  });
  return {
    users: rows,
    total: count,
  };
};
