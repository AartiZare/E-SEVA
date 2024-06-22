// import express from 'express';
// import cors from 'cors';
// import router from './routes/index.js';
// import httpStatus from 'http-status';
// import bodyParser from "body-parser";
// import ApiError from './utils/ApiError.js';
// import { errorHandler } from './middlewares/validate.js';
// import passport from 'passport';
// import { jwtStrategy } from './middlewares/passport.js';
// import path from "path";
// //const path = require('path');

// const __filename = path.resolve();
// const __dirname = path.dirname(__filename);

// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// // const corOptions = {
// //     origin: 'https://localhost:8081'
// // };

// const PORT = process.env.PORT || 8080;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use("/", express.static(path.join(__dirname, "public")));

// app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// app.get('/', (req, res) => {
//     res.json({ message: "First API Added" });
// });

// // jwt authentication
// app.use(passport.initialize());
// passport.use('jwt', jwtStrategy);

// app.use('/', router);

// app.use((req, res, next) => {
//     console.log(req.url);

//     next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });

// app.use(errorHandler);

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


// server.js or app.js (your main server file)
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import httpStatus from 'http-status';
import bodyParser from "body-parser";
import ApiError from './utils/ApiError.js';
import { errorHandler } from './middlewares/validate.js';
import passport from 'passport';
import { jwtStrategy } from './middlewares/passport.js';
import path from "path";
import logger from './loggers.js'; // Import the logger

const __filename = path.resolve();
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// const corOptions = {
//     origin: 'https://localhost:8081'
// };

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", express.static(path.join(__dirname, "public")));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: "First API Added" });
});

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use('/', router);

app.use((req, res, next) => {
    logger.warn(`404 Not Found - ${req.url}`); // Log 404 errors
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`); // Log server start
});
