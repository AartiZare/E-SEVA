import Role from "./roleModel.js";

const vendorModel = (sequelize, DataTypes) => {
  const Vendor = sequelize.define(
    "vendor",
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
      reset_otp: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      reset_otp_expiration: {
        type: DataTypes.DATE,
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
        allowNull: false,
      },
      bank_branch: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bank_ifsc: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bank_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING,
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
    },
    { timestamps: true, tableName: "tbl_vendors" }
  );

  Vendor.belongsTo(Role(sequelize, DataTypes), { foreignKey: "role_id" });

  return Vendor;
};

export default vendorModel;
