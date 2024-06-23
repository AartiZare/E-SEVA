const documentsModel = (sequelize, DataTypes) => {
  const Documents = sequelize.define(
    "documents",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image_pdf: {
        type: DataTypes.STRING,
      },
      document_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document_reg_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document_unique_id: {
        type: DataTypes.STRING,
      },
      document_reg_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      document_renewal_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      total_no_of_page: {
        type: DataTypes.INTEGER,
      },
      authorised_persons: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Name of the User table
          key: "id",
        },
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Name of the User table
          key: "id",
        },
      },
      document_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      document_upload_status: {
        type: DataTypes.STRING,
        defaultValue: false,
      },
      document_created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: "tbl_documents",
    }
  );

  return Documents;
};

export default documentsModel;
