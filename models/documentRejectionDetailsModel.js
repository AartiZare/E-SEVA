const documentRejectionModel = (sequelize, DataTypes) => {
    const DocumentRejection = sequelize.define(
      "document_rejection_details",
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
            model: 'tbl_documents',  // assuming the document table is named 'documents'
            key: 'id',
          },
        },
        rejected_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'tbl_users',  // assuming the user table is named 'users'
            key: 'id',
          },
        },
        issue_types: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
          defaultValue: [],
        },
        rejected_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        other_reasons: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: "tbl_document_rejections_details",
      }
    );
  
    return DocumentRejection;
  };
  
  export default documentRejectionModel;
  