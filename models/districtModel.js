// models/districtModel.js
const districtModel = (sequelize, DataTypes) => {
    const District = sequelize.define('districts', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        divisionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'divisions', // Name of the Division model
                key: 'id'
            }
        }
    }, {
        timestamps: true
    });

    District.associate = (models) => {
        District.belongsTo(models.Division, {
            foreignKey: 'divisionId',
            as: 'division'
        });
    };

    return District;
};

export default districtModel;
