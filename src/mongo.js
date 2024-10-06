const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/LoginFormPractice")
    .then(() => {
        console.log('mongoose connected');
    })
    .catch((e) => {
        console.log('failed', e);
    });

// Student Schema
const StudentSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    }
});

// Login Schema
const logInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Creating models
const StudCollection = mongoose.model('StudCollection', StudentSchema);
const LogInCollection = mongoose.model('LogInCollection', logInSchema);

// Exporting models
module.exports = {
    StudCollection,
    LogInCollection
};
