const roleModel = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      complete_access: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: "tbl_user_roles",
    }
  );
  return Role;
};

export default roleModel;
