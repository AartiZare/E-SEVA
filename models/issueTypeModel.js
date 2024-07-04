const issueTypeModel = (sequelize, DataTypes) => {
  const IssueType = sequelize.define(
    "issue_type",  // Updated model name
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      issue_types: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "tb_issue_types",  // Updated table name
    }
  );

  return IssueType;
};

export default issueTypeModel;
