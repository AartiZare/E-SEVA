const rejectionReasonModel = (sequelize, DataTypes) => {
    const RejectionReason = sequelize.define(
      "rejection_reason",
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
        tableName: "tbl_rejection_reasons",
      }
    );
    return RejectionReason;
  };
  
  export default rejectionReasonModel;
  