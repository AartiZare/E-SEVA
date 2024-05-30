import userModel from './userModel.js';
import branchModel from './branchModel.js';
import userBranchModel from './userBranchModel.js';

const setupAssociations = (sequelize) => {
    const User = userModel(sequelize, sequelize.Sequelize.DataTypes);
    const Branch = branchModel(sequelize, sequelize.Sequelize.DataTypes);
    const UserBranch = userBranchModel(sequelize, sequelize.Sequelize.DataTypes);

    User.belongsToMany(Branch, { through: UserBranch, foreignKey: 'userId' });
    Branch.belongsToMany(User, { through: UserBranch, foreignKey: 'branchId' });

    UserBranch.belongsTo(User, { foreignKey: 'userId' });
    UserBranch.belongsTo(Branch, { foreignKey: 'branchId' });

    return {
        User,
        Branch,
        UserBranch,
    };
};

export default setupAssociations;
