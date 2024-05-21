import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import { userService } from '../services';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import db from '../models';
import { genToken } from '../middlewares/passport';
const userModel = db.Users;

export const create = catchAsync(async (req, res, next) => {
    try {
        const { body } = req;
        // console.log(req.user, "logged in user")
        // body.created_by = req.user.id;
        body.email_id = body.email_id.toLowerCase();
        const hashedPassword = await bcrypt.hash(body.password, 10);
        
        const user = await userModel.findOne({
            where: {
                [Op.or]: [
                    { email_id: body.email_id },
                    { contact_no: body.contact_no }
                ]
            }
        });

        if (user) {
            if (user.email_id === body.email_id && user.contact_no !== body.contact_no) {
                return next(new ApiError(httpStatus.BAD_REQUEST, `email ${body.email_id} is already exist!`));
            }
            if (user.contact_no === body.contact_no && user.email_id !== body.email_id) {
                return next(new ApiError(httpStatus.BAD_REQUEST, `phone no ${body.contact_no} is already exist!`));
            }
            if ( user.email_id === body.email_id && user.contact_no === body.contact_no) {
                return next(new ApiError(httpStatus.BAD_REQUEST, 'user already exist'));
            }
        }

        const createdUser = await userService.createUser({...body, password: hashedPassword});
        return res.send(createdUser);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const getAll = catchAsync(async (req, res) => {
    try {
        const { qFilter } = req.query;
        let filter = {};
        if (qFilter) {
            filter = {
                ...JSON.parse(qFilter),
            };
        }
        let page = parseInt(req.query.page) || 1;
        let pageSize = parseInt(req.query.pageSize) || 10;
        if (req.query.search) {
            const searchTerm = req.query.search.trim();
            if (searchTerm !== '') {
                filter = {
                    name: {
                        [Op.like]: `%${searchTerm}%`
                    }
                };
            }
        }
        const query = {
            ...filter,
        };

        const users = await userService.getAll(query, page, pageSize);
        return res.send(users);
    } catch (error) {
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});


export const update = catchAsync(async (req, res, next) => {
    try {
        // const { body } = req;
        const id = req.params.id;
        const updatedData = req.body;
        // body.updated_by = req.user.id;
        // const role = await roleModel.findByPk(req.user.roleId);
       
        // if(role){
        //     if(role.type !== enumModel.EnumtypeOfRole.ADMIN){
        //         return next(new ApiError(httpStatus.BAD_REQUEST, `Only Admin has access to edit user details!`));
        //     }
        // }
        const [rowsUpdated, updatedUsers] = await userService.updateOneUser(id, updatedData);

        if (rowsUpdated === 0) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `User with id ${id} doesn't exist!`));
        }
        return res.send({ message: 'User updated successfully', rowsUpdated, updatedUsers });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});

export const getUserById = catchAsync(async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await userService.getById(id);
        if (!user) {
            return next(new ApiError(httpStatus.BAD_REQUEST, `User with id ${id} does not exist!`));
        }
        return res.send(user)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
});


export const login = catchAsync(async (req, res, next) => {
    try {
        const { password } = req.body;
        let { email_id } = req.body;
        email_id = email_id.toLowerCase();

        const noUserErrorNext = () => next(new ApiError(httpStatus.BAD_REQUEST, 'Invalid Email ID or Password'));
        let user = await userModel.findOne({ where: { email_id: req.body.email_id } });
        if (!user) {
            return noUserErrorNext();
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = genToken(user);
            return res.status(200).json({ msg: "Logged in sucessfully", user: user, token: token });
        }
        return noUserErrorNext();
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
})
