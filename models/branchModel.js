const branchModel = (sequelize, DataTypes) => {
  const Branch = sequelize.define(
    "branche",
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
      branch_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      taluk_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "taluks", // name of the Taluks table
          key: "id",
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users", // name of the Users table
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
      tableName: "tbl_branches",
    }
  );

  return Branch;
};

export default branchModel;
