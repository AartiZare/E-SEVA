const documentTypeModel = (sequelize, DataTypes) => {
    const DocumentType = sequelize.define('DocumentType', {
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
        }
    }, {
        timestamps: true
    });

    return DocumentType;
}

export default documentTypeModel;
