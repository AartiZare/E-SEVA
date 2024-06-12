import Role from './roleModel.js';
import userBranchModel from './userBranchModel.js';
import branchModel from './branchModel.js';
import { JSONB } from 'sequelize';

const userModel = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        full_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
        assignedStateId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'states', // name of the States table
                key: 'id',
            },
        },
        assignedDivisionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'divisions', // name of the Divisions table
                key: 'id',
            },
        },
        assignedDistrictId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'districts', // name of the Districts table
                key: 'id',
            },
        },
        assignedTalukId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'taluks', // name of the Taluks table
                key: 'id',
            },
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
            allowNull: true,
        },
        branch: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            defaultValue: [],            
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        ifsc: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        bank_branch:{
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, { timestamps: true });

    User.belongsTo(Role(sequelize, DataTypes), { foreignKey: 'roleId' });

    return User;
};

export default userModel;
