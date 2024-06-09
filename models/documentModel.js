const documentsModel = (sequelize, DataTypes) => {
    const Documents = sequelize.define('documents', {
        image_pdf: {
            type: DataTypes.STRING,
        },
        document_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        branch: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        rejected_by_supervisor: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        rejected_by_squad: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_document_rejected: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
        authorised_persons: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
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
        },
        supervisor_verification_status: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        squad_verification_status: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        final_verification_status: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        timestamps: true
    });

    return Documents;
}

export default documentsModel;
