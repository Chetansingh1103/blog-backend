const express = require('express');
const { createBlog, getUserBlogs, deleteBlog, editBlog, getHomepageBlogs } = require('../controllers/blog.controller');
const { isAuth } = require('../middlewares/AuthMiddleware');

const app = express();

// create blog
app.post('/create',isAuth, createBlog);

// get user blogs
app.get('/get-user-blogs', isAuth,getUserBlogs );

//delete blog
app.delete('/delete-blog/:blogId',isAuth,deleteBlog);

// edit blog
app.put('/edit-blog',isAuth,editBlog);

// gethomepageblogs
app.get('/get-homepage-blogs',isAuth,getHomepageBlogs)

module.exports = app