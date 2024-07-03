const downloadedDocumentLogModel = (sequelize, DataTypes) => {
    const DownloadLog = sequelize.define(
        'DownloadLog',
        {
          downloaded_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          document_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          downloaded_by_role: {
            type: DataTypes.STRING,
            allowNull: true
          },
          download_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
          }
        },
        {
          timestamps: true,
          tableName: 'tbl_downloaded_document_logs',
        }
      );
    
      return DownloadLog;
  };
  
  export default downloadedDocumentLogModel;
  