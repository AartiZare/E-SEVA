const contactUslModel = (sequelize, DataTypes) => {
    const ContactUs = sequelize.define('contact_us', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roleId:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      type: {
        type: DataTypes.ENUM('query', 'feedback', 'complaint'),
        allowNull: false
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      timestamps: true,
    });
  
    return ContactUs;
  }
  
  export default contactUslModel;
  