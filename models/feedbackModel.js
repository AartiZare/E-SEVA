const feedbackModel = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('feedbacks', {
        user_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_email:  {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users', // name of the Users table
                key: 'id',
            },
        },
        mobile_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        feedback_for: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });

    return Feedback;
};

export default feedbackModel;
