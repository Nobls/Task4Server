import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";


dotenv.config()

const JWT_KEY = process.env.JWT_KEY

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
            JWT_KEY,
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

        const isPasswordCorrect = await bcrypt.compare(password, user._doc.password)

        if (!isPasswordCorrect) {
            return res.json({
                message: 'Неверный пароль'
            })
        }

        const token = jwt.sign(
            {
                _id: user._id
            },
            JWT_KEY,
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