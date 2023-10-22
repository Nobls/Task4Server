import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {format} from "date-fns";


dotenv.config()

export const registration = async (req, res) => {
    try {
        const { username,email, password, position } = req.body

        const isUsed = await UserModel.findOne({email})

        if (isUsed){
            return res.json({
                message: 'This email is already taken'
            })
        }

        const salt = bcrypt.genSaltSync(10)

        const hash = bcrypt.hashSync(password, salt)

        const newUser = new UserModel({
            username,
            password: hash,
            email,
            position,
        })

        const token = jwt.sign(
            {
                _id: newUser._id,
            },
            'secretKey1234',
            {
                expiresIn: '30d'
            }
        )

        await newUser.save()

        res.json({
            newUser,
            token,
            message: 'Registration completed successfully.'
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Failed to register',
        })
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body

        const user = await UserModel.findOne({email})

        if (!user){
            return res.json({
                message: 'Такого юзера не существует.'
            })
        }

        if (user.status === 'blocked') {
            return res.status(403).json({
                message: 'Ваш аккаунт заблокирован.'
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user._doc.password)

        if (!isPasswordCorrect) {
            return res.json({
                message: 'Неверный пароль'
            })
        }

        user.lastLoginDate = new Date();
        await user.save();

        const token = jwt.sign(
            {
                _id: user._id
            },
            'secretKey1234',
            {expiresIn: '30d'}
        )

        res.json({
            token,
            user,
            message: 'Вы авторизовались'
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        })
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).join({
                message: 'Пользователь не найден',
            })
        }

        const {password, ...userData} = user._doc;

        res.json(userData);
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Нет доступа',
        })
    }
};

export const getAll = async (req, res) => {
    try {
        const users = await UserModel.find()

        const formattedUsers = users.map(user => ({
            ...user._doc,
            registrationDate: format(user.registrationDate, 'dd.MM.yyyy, HH:mm:ss'),
            lastLoginDate: user.lastLoginDate ? format(user.lastLoginDate, 'dd.MM.yyyy, HH:mm:ss') : null,
        }));

        res.json(formattedUsers)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить пользователей',
        })
    }
}

export const blockUser = async (req, res) => {
    const userIds = req.body.userIds

    try {
        const users = await UserModel.find({ _id: { $in: userIds } })

        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователи не найдены' })
        }

        for (const user of users) {
            user.status = 'blocked'
            await user.save()
        }

        return res.json({ message: 'Статус пользователей успешно изменен на "blocked"' })
    } catch (error) {
        return res.status(500).json({ message: 'Произошла ошибка при изменении статуса пользователей' })
    }
}

export const unBlockUser = async (req, res) => {
    const userIds = req.body.userIds

    try {
        const users = await UserModel.find({ _id: { $in: userIds } })

        if (users.length === 0) {
            return res.status(404).json({ message: 'Пользователи не найдены' })
        }

        for (const user of users) {
            user.status = 'active'
            await user.save()
        }

        return res.json({ message: 'Статус пользователей успешно изменен на "unblocked"' })
    } catch (error) {
        return res.status(500).json({ message: 'Произошла ошибка при изменении статуса пользователей' })
    }
}

export const remove = async (req, res) => {
    try {
        const userId = req.params.userId;

        const deletedUser = await UserModel.findByIdAndRemove(userId);

        if (deletedUser) {
            res.json({ message: 'Пользователь успешно удален' });
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Произошла ошибка при удалении пользователя' });
    }
};