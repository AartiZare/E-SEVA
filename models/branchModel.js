const branchModel = (sequelize, DataTypes) => {
    const Branch = sequelize.define("branches", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    }, {
        timestamps: true
    });

    return Branch;
};

export default branchModel;
