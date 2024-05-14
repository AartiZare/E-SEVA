export default {
    HOST: 'localhost',
    USER: 'postgres',
    PASSWORD: 'Pacewisdom@12345',
    DB: 'New_Project',
    dialect: 'postgres',
    logging: true,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
