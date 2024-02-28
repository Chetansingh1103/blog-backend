const joi = require('joi');
const User = require('../models/User');
const Follow = require('../models/Follow');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Post - register user
const registerUser = async (req, res) => {

    // Data validation
    const isValid = joi.object({
        name: joi.string().required(),
        username: joi.string().min(3).max(25).alphanum().required(),
        password: joi.string().min(8).required(),
        email: joi.string().email().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }


    // always database calls comes in try and catch
    try{

        const user = await User.find({ $or: [{username: req.body.username}, {email: req.body.email}]})

        if(user.length !== 0){
            return res.status(400).send({
                status: 400,
                message: "User/email already exists!"
            })
        }

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }


    // hasing password
    const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);


    // creating user object from userSchema
    const user = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    })


    // saving user in database 
    try{
        await user.save();
        return res.status(200).send({
            status: 200,
            message: "User registered successfully!"
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }

}

// post - login user
const loginUser = async (req, res) => {
    // Data validation
    const isValid = joi.object({
        username: joi.string().required(),
        password: joi.string().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid Username / Password",
            data: isValid.error
        })
    }


    let user;

    // fetching data from database
    try{
        user = await User.findOne({username: req.body.username})

        if(!user){
            return res.status(400).send({
                status: 400,
                message: "No user found! please register!"
            })
        }
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching user data",
            data: err
        })
    }

    const isPasswordSame = await bcrypt.compare(req.body.password, user.password)

    if(!isPasswordSame){
        return res.status(400).send({
            status: 400,
            message: "Invalid Password"
        })
    }

    const payload = {
        name: user.name,
        username: user.username,
        email: user.email,
        userId: user._id
    }

    const token = jwt.sign(payload, JWT_SECRET_KEY) // sign is synchronous so no need of await

    return res.status(200).send({
        status: 200,
        message: "Login successful!",
        data: {
            token: token
        }
    })

}

const getAllUsers = async (req, res) => {

    const userId = req.locals.userId;

    let followingList;       

    try{

        followingList = await Follow.find({currentUserId: userId});

        let followingUserIds = [];

        const users = await User.find({_id: {$ne: userId}}); // $ne means not included

        let userList = []; // creating new userlist to remove password from above list

        followingList.forEach((follow) => {
            followingUserIds.push(follow.followingUserId)
        })

        users.forEach((user) => {
            if(followingUserIds.includes(user._id.toString())){
                let userObj = {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    _id: user._id,
                    follow: true
                };
                userList.push(userObj);
            } else {
                let userObj = {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    _id: user._id,
                    follow: false
                };
                userList.push(userObj);
            }
        })


        return res.status(200).send({
            status: 200,
            message: "Users fetched successfully!",
            data: userList
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }
}

module.exports = { registerUser, loginUser, getAllUsers }