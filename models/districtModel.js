const districtModel = (sequelize, DataTypes) => {
  const District = sequelize.define(
    "district",
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
      division_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "division", // Name of the Division model
          key: "id",
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: "tbl_districts",
    }
  );

  District.associate = (models) => {
    District.belongsTo(models.Division, {
      foreignKey: "divisionId",
      as: "division",
    });
  };

  return District;
};

export default districtModel;
