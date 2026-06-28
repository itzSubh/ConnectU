import fs from 'fs'
import imagekit from "../config/imagekit.js";
import Post from '../models/post.model.js';
import User from '../models/user.model.js';

// Add Posts
export const addPost = async (req, res) => {
    try {
        const { userId }= req.auth();
        const { content, post_type } = req.body;
        const images = req.files

        let image_urls = []
        if(images.length){
            image_urls = await Promise.all(
                images.map(async (image) => {
                const buffer= fs.createReadStream(image.path)
                const response = await imagekit.files.upload({
                                file: buffer,
                                fileName: image.originalname,
                                folder: 'posts',
                                transformation: {
                                    post: [
                                        {
                                            type: "transformation",
                                            value: "q-auto,f-webp,w-512"
                                        }
                                    ]
                                }
    
                                });
                                return response.url;
                })
            )
        }
        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })
        return res.json({success: true, message: 'Post created Successfully'})
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
        
    }
    
}

// Get Posts
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)

        // user connections and following
        const userIds = [userId, ...user.connections, ...user.following]
const posts = await Post.find({ user: { $in: userIds } })
    .populate("user")
    .sort({ createdAt: -1 });

// Remove posts whose owner no longer exists
const validPosts = posts.filter(post => post.user !== null);

return res.json({
    success: true,
    posts: validPosts
});
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
    }
}

// Like Post

export const likePost = async (req, res) => {
    try {
        const { userId }= req.auth();
        const { postId }= req.body;

        const post = await Post.findById(postId)

        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save()
            return res.json({success: true, message: 'Post Unliked'})
        }else{
            post.likes_count.push(userId)
            await post.save()
            return res.json({success: true, message: 'Post Liked'})
        }
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
    }
}