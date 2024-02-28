const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../controllers/user.controller');
const { isAuth } = require('../middlewares/AuthMiddleware');

const app = express();

// register user
app.post('/register', registerUser)
// login user
app.post('/login', loginUser)
// get all users
app.get('/get-all-users', isAuth, getAllUsers)


module.exports = app;