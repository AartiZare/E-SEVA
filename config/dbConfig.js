// export default {
//     HOST: 'localhost',
//     USER: 'postgres',
//     PASSWORD: 'Pacewisdom@12345',
//     DB: 'New_Project',
//     dialect: 'postgres',
//     logging: true,
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// }

export default {
    HOST: '52.66.238.70',
    // port: 5432,
    // logging: console.log,
    maxConcurrentQueries: 100,
    dialect: 'postgres',
    USER: 'postgres',
    PASSWORD: 'Welcome123#',
    DB: 'e-sevadev',
    pool: { maxConnections: 5, maxIdleTime: 30},
    language: 'en'
}

//test profile

// export default {
//   HOST: 'localhost',
//   port: 5432,
//   logging: console.log,
//   maxConcurrentQueries: 100,
//   dialect: 'postgres',
//   USER: 'postgres', 
//   DB: 'test1',
//   pool: { maxConnections: 5, maxIdleTime: 30},
//   language: 'en'
// }