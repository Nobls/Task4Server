import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv'
import * as UserController from "./controllers/UserController.js";

/*import {checkAuth,} from "./utils/index.js";*/



const app = express();
dotenv.config()

const PORT = process.env.PORT
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD

mongoose
    .connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.qne5qdy.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => console.log('DB Ok'))
    .catch((err) => console.log('DB error', err))

app.use(express.json());
app.use(cors());

app.post('/registration', UserController.registration);

app.listen(PORT, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log('Server Ok')
});