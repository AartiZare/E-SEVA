// In authorisedPersonModel.js
const authorisedPersonModel = (sequelize, DataTypes) => {
    const AuthorisedPerson = sequelize.define('authorised_persons', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        alternate_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    AuthorisedPerson.associate = (models) => {
        AuthorisedPerson.belongsTo(models.Documents, { foreignKey: 'documentId' });
    };

    return AuthorisedPerson;
};

export default authorisedPersonModel;
