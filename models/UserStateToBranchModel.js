const userStateToBranchModel = (sequelize, DataTypes) => {
    const UserStateToBranch = sequelize.define("user_state_to_branch", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // name of the Users table
                key: 'id',
            },
        },
        state_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        division_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        district_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        taluk_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        branch_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // name of the Users table
                key: 'id',
            },
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // name of the Users table
                key: 'id',
            },
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1,
        }
    }, {
        timestamps: true
    });

    return UserStateToBranch;
};

export default userStateToBranchModel;