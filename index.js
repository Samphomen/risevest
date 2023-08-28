const express = require('express')
const app = express()
const port = 5000
const cors = require("cors")
const fileUpload = require("express-fileupload");
const multer = require('multer')
const upload = multer({dest: "tmp/"})

//express middlewares


// Middlewares
app.use(cors())
app.use(express.json());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp",
    limits: { fileSize: 200 * 1024 * 1024 }
}));


// routes
const uploadRouter = require("./routes/fileRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");




app.use("/api/v1/uploads",uploadRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`server has started on port ${port}`);
})