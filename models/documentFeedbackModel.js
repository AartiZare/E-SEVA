const documentFeedbackModel = (sequelize, DataTypes) => {
  const DocumentFeedback = sequelize.define(
    'documentFeedback',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_documents',
          key: 'id',
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      feedback_for: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_vendors',
          key: 'id',
        },
      },
      squad_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users',
          key: 'id',
        },
      },
      supervisor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users',
          key: 'id',
        },
      },
      uploader_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users',
          key: 'id',
        },
      }
    },
    {
      timestamps: true,
      tableName: 'tbl_document_feedbacks',
    }
  );

  return DocumentFeedback;
};

export default documentFeedbackModel;
