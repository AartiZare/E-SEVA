const activityModel = (sequelize, DataTypes) => {
  const Activity = sequelize.define(
    "activity",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      activity_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      activity_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      activity_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      activity_created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activity_created_by_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      activity_document_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "documents",
          key: "id",
        },
      },
    },
    {
      timestamps: false,
      tableName: "tbl_activities",
    }
  );

  return Activity;
};

export default activityModel;
