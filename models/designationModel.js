
const designationModel = (sequelize, DataTypes) => {
    const Designation = sequelize.define('Designation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    }
    },
    {
        timestamps: false
    });
    return Designation
}
export default designationModel;