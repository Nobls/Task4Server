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