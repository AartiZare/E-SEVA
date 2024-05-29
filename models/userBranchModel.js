import { DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig.js';

const userBranchModel = (sequelize, DataTypes) => {
    const UserBranch = sequelize.define('UserBranch', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        branchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    });

    return UserBranch;
};

export default userBranchModel;
