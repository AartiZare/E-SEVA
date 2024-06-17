const documentTypeModel = (sequelize, DataTypes) => {
  const DocumentType = sequelize.define(
    "documentType",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: "tbl_document_types",
    }
  );

  return DocumentType;
};

export default documentTypeModel;
