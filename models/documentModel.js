const documentsModel = (sequelize, DataTypes) => {
    const Documents = sequelize.define('documents', {
        image_pdf: {
            type: DataTypes.STRING,
        },
        document_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        document_reg_no: {
            type: DataTypes.STRING,
            allowNull: false
        },
        approved_by_supervisor: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        approved_by_squad: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_document_approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        document_unique_id: {
            type: DataTypes.STRING,
        },
        document_reg_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        document_renewal_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        total_no_of_page: {
            type: DataTypes.INTEGER,
        },
        authorised_person_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        alternate_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // Name of the Users table
                key: 'id'
            }
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', // Name of the Users table
                key: 'id'
            }
        }
    }, {
        timestamps: true
    });

    return Documents;
}

export default documentsModel;
