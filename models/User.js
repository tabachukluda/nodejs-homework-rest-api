const { Schema, model } = require('mongoose');
const { handleSaveError, runValidatorsAtUpdate } = require('./hooks.js')

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema({
    password: {
    type: String,
    required: [true, 'Password is required'],
    },
    email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: emailRegexp,
    },
    subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
    },
    avatarURL: {
	type: String,
	},
    token: {
    type: String,
    default: null,
    },
}, { versionKey: false, timestamps: true })

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", runValidatorsAtUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);

module.exports = User