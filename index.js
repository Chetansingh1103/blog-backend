const express = require('express')
require('dotenv').config();
const cors = require('cors');

//file imports
const database = require('./config/database') // this is the connection of mongoose to mongodb from file database.js
const userRoutes = require('./routes/user')
const blogRoutes = require('./routes/blog')
const followRoutes = require('./routes/follow')
const {cleanUpBin} = require('./utils/cron')

const app = express();

const PORT = process.env.PORT;

app.use(express.json()) // middleware
app.use(
    cors({
        origin: "*"
    })
)


//--------------------routes------------------------

// user route
app.use("/user", userRoutes)

// blog route
app.use("/blog", blogRoutes)

// follow route
app.use("/follow", followRoutes)


app.listen(PORT , () => { // listen runs everytime
    console.log("Server running at port:", PORT)
    cleanUpBin();
});