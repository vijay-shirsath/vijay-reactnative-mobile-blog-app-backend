import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import morgan from "morgan";
import createPostRoute from "./routes/post.js";
import cores from "cors";

const app = express();
app.use(morgan("dev"));
app.use(cores());

const connectionString = process.env.DB_URL;
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("database connected successfully"))
.catch("error", (err) => console.log(err));

app.use("/api/post",createPostRoute);

app.get("/", (req,res) => {
    res.send("this is the blog cross platform react native application")
});
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`the server is running on port ${port}`)
})