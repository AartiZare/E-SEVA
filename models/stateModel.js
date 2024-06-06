const stateModel = (sequelize, DataTypes) => {
    const State = sequelize.define('state', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
    });

    return State;
}

export default stateModel;
