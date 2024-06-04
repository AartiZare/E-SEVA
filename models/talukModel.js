const talukModel = (sequelize, DataTypes) => {
    const Taluk = sequelize.define('taluks', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        districtId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'districts',
                key: 'id'
            }
        }
    }, {
        timestamps: true
    });

    Taluk.associate = models => {
        Taluk.belongsTo(models.District, {
            foreignKey: 'districtId',
            as: 'district'
        });
    };

    return Taluk;
};

export default talukModel; 