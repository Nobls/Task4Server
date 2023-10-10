import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    position: {type: String},
    registrationDate: { type: Date, default: Date.now },
    lastLoginDate: { type: Date },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' }
});

export default mongoose.model('User', UserSchema)
