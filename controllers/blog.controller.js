const joi = require('joi');
const Blog = require('../models/Blog');
const Follow = require('../models/Follow');


// create blog
const createBlog = async (req, res) => {

    //data validation
    const isValid = joi.object({
        title: joi.string().required(),
        textBody: joi.string().required()
    }).validate(req.body)

    if(isValid.error) {
        return res.status(400).send({
            status: 400,
            message: "isValid.error.message"
        })
    }

    // creating blog object
    const blog = new Blog({
        title: req.body.title,
        textBody: req.body.textBody,
        creationDateTime: Date.now(),
        userId: req.locals.userId,
        username: req.locals.username
    })

    try{

        await blog.save()

        return res.status(201).send({
            status: 201,
            message: "Blog created successfully!"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error occured!"
        })
    }
}

// get user blogs
const getUserBlogs = async (req, res) => {
    const userId = req.locals.userId;  // every api call has different locals and as soon as the response is sent back the locals is finished
    const page = Number(req.query.page) || 1;
    const LIMIT = 10;

    let blogData;

    try{

        blogData = await Blog.find({userId, isDeleted: false}).sort({creationDateTime: -1}).skip((page - 1) * LIMIT).limit(LIMIT)

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Fialed to get user blogs",
            data: err
        })
    }

    res.status(200).send({
        status: 200,
        message: "Fetched user blogs successfully!",
        data: blogData
    })
}

// delete a blog
const deleteBlog = async (req, res) => {

    const userId = req.locals.userId;
    const blogId = req.params.blogId;

    let blogData;

    try{

        blogData = await Blog.findById(blogId);

        console.log(blogData)

        if(!blogData){
            return res.status(404).send({
                status: 404,
                message: "Blog not found!"
            })
        }

        if(blogData && blogData.userId != userId){
            return res.status(401).send({
                status: 401,
                message: "You are not authorized to delete this blog!"
            })
        }

        await Blog.findByIdAndUpdate(blogId, {isDeleted: true, deletiondateTime: Date.now()})

        return res.status(200).send({
            status: 200,
            message: "Blog deleted successfully!"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to delete blog",
            data: err
        })
    }
}

// PUT - edit blog 
const editBlog = async (req, res) => {
    //data validation
    const isValid = joi.object({
        blogId: joi.string().required(),
        title: joi.string().required(),
        textBody: joi.string().required()
    }).validate(req.body)

    if(isValid.error) {
        return res.status(400).send({
            status: 400,
            message: "invalid input"
        })
    }

    const userBody = req.body;
    const userId = req.locals.userId;
    const blogId = userBody.blogId; // taking blog id from body of http req

    let blogData;

    try{

        blogData = await Blog.findById(blogId);

        console.log(blogData)

        if(!blogData){
            return res.status(404).send({
                status: 404,
                message: "Blog not found!"
            })
        }

        if(blogData && blogData.userId != userId){
            return res.status(401).send({
                status: 401,
                message: "You are not authorized to edit this blog!"
            })
        }

        const creationDateTime = blogData.creationDateTime;
        const currentTime = Date.now();

        const diff = (currentTime - creationDateTime)/ (1000 * 60) // converting into minutes based on miliseconds from jan 1970

        if(diff > 30){

            return res.status(400).send({
                status: 400,
                message: "You cannot edit this blog after 30 minutes!"
            })

        }

        await Blog.findByIdAndUpdate(blogId, {title: userBody.title, textBody: userBody.textBody})

        return res.status(200).send({
            status: 200,
            message: "Blog edited successfully!"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to delete blog",
            data: err
        })
    }

}

// get homepage blogs
const getHomepageBlogs = async (req, res) => {

    const currentUserId = req.locals.userId;

    let followingList;
    let followingUserIds = [];

    try{

        followingList = await Follow.find({currentUserId: currentUserId});

        console.log(" gg ", Follow.find({currentUserId: currentUserId}))

        if(followingList.length === 0){
            return res.status(400).send({
                status: 400,
                message: "You are not following anyone!"
            })
        }

        followingList.forEach((followObj) => {
            followingUserIds.push(followObj.followingUserId)
        })

        const homepageBlogs = await Blog.find({ userId: { $in: followingUserIds}, isDeleted: false }).sort({creationDateTime: -1})

        res.status(200).send({
            status: 200,
            message: "Fetched homepage blogs successfully!",
            data: homepageBlogs
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to get user blogs",
            data: err.message
        })
    }

}

module.exports = { createBlog, getUserBlogs, deleteBlog, editBlog, getHomepageBlogs }