import Role from './roleModel.js';

const vendorModel = (sequelize, DataTypes) => {
    const Vendor = sequelize.define("vendor", {
        full_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profile_image: {
            type: DataTypes.STRING,
        },
        email_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        alt_contact_no: {
            type: DataTypes.STRING,
        },
        pan_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        adhar_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        qualifications: {
            type: DataTypes.STRING,
        },
        resetOTP: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING
        },
        resetOTPExpiration: {
            type: DataTypes.DATE
        },
        dob: {
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
        account_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        branch: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ifsc: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, { timestamps: true });

    Vendor.belongsTo(Role(sequelize, DataTypes), { foreignKey: 'roleId' });

    return Vendor;
};

export default vendorModel;
