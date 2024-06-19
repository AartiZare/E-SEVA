import Role from "./roleModel.js";

const userModel = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_image: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alternate_contact_number: {
        type: DataTypes.STRING,
      },
      pan_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadhaar_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qualification: {
        type: DataTypes.STRING,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      taluk: {
        type: DataTypes.STRING,
      },
      village: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bank_account_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
      },
      bank_ifsc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bank_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
      },
      reset_otp: {
        type: DataTypes.STRING,
      },
      reset_otp_expiration: {
        type: DataTypes.DATE,
      },
      bank_branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "vendor",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      tableName: "tbl_users",
    }
  );

  User.belongsTo(Role(sequelize, DataTypes), { foreignKey: "role_id" });

  return User;
};

export default userModel;
