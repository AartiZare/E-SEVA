const divisionModel = (sequelize, DataTypes) => {
  const Division = sequelize.define(
    "division",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "state", // Name of the State model
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
      tableName: "tbl_divisions",
    }
  );

  Division.associate = (models) => {
    Division.belongsTo(models.State, {
      foreignKey: "stateId",
      as: "state",
    });
  };

  return Division;
};

export default divisionModel;
