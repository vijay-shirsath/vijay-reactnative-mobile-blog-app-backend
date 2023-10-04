import mongoose from "mongoose";

const featured = mongoose.Schema({
    post : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "BlogPost",
        required : true,
    }
},
{
    timestamps : true
}
);
const FeaturedPost = mongoose.model("FeaturedPosts",featured);
export default FeaturedPost;