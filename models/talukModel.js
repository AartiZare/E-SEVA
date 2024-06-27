const talukModel = (sequelize, DataTypes) => {
  const Taluk = sequelize.define(
    "taluk",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "districts",
          key: "id",
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: "tbl_taluks",
    }
  );

  Taluk.associate = (models) => {
    Taluk.belongsTo(models.District, {
      foreignKey: "district_id",
      as: "district",
    });
  };

  return Taluk;
};

export default talukModel;
