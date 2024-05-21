import db from '../models';
const userModel = db.Users;

export async function createUser(body, options) {
    return userModel.create(body, options);
}
export async function updateOneUser(id, updatedData) {
    const [rowsUpdated] = await userModel.update(updatedData, { where: { id: id } });
    const updatedUsers = await userModel.findByPk(id);
    return [rowsUpdated, updatedUsers];
}
export async function deleteUser(id) {
    return await userModel.destroy({where: {id: id}});
}
export async function getById(id) {
    return await userModel.findByPk(id);
}
export async function getAll(filter, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    return await userModel.findAll({
        where: filter,
        offset,
        limit: pageSize,
    });
}

