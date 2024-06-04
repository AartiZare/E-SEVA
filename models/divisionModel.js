// models/divisionModel.js
const divisionModel = (sequelize, DataTypes) => {
    const Division = sequelize.define('divisions', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        stateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'states', // Name of the State model
                key: 'id'
            }
        }
    }, {
        timestamps: true
    });

    Division.associate = (models) => {
        Division.belongsTo(models.State, {
            foreignKey: 'stateId',
            as: 'state'
        });
    };

    return Division;
};

export default divisionModel;
