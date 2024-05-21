// import enumModel from './enumModel';
// import UserModel from './userModel'; 

const roleModel = (sequelize, DataTypes) => {
    const Role = sequelize.define("roles", {
        name: {
            type: DataTypes.STRING,
            // allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        complete_access: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        timestamps: true
    });

    // // Define associations
    // Role.belongsTo(UserModel, { as: 'createdBy', foreignKey: 'created_by' });
    // Role.belongsTo(UserModel, { as: 'updatedBy', foreignKey: 'updated_by' });

    return Role;
}

export default roleModel;
