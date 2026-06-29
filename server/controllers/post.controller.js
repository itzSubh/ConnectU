import fs from 'fs'
import imagekit from "../config/imagekit.js";
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Like from '../models/like.model.js';

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
// Get posts
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth();

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        // User's own posts + connections + following
        const userIds = [
            userId,
            ...user.connections,
            ...user.following,
        ];

        const posts = await Post.find({
            user: { $in: userIds },
        })
            .populate("user")
            .sort({ createdAt: -1 });

        // Remove posts whose owner no longer exists
        const validPosts = posts.filter(post => post.user);

        // Add like information to every post
        const postsWithLikes = await Promise.all(
            validPosts.map(async (post) => {

                const likesCount = await Like.countDocuments({
                    post: post._id,
                });

                const liked = await Like.exists({
                    post: post._id,
                    user: userId,
                });

                return {
                    ...post.toObject(),
                    likesCount,
                    liked: !!liked,
                };
            })
        );

        return res.json({
            success: true,
            posts: postsWithLikes,
        });

    } catch (error) {
        console.log(error);

        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Like Post

export const likePost = async (req, res) => {
    try {
        console.log("LIKE CONTROLLER RUNNING");
        const { userId }= req.auth();
        const { postId }= req.body;

        const post = await Post.findById(postId)
        const existingLike = await Like.findOne({
            post: postId,
            user: userId
        })
        if(existingLike){
            await Like.findByIdAndDelete(existingLike._id)
            const likesCount = await Like.countDocuments({post: postId})
            return res.json({success: true, liked: false, likesCount, message:'Post Unliked'})
        }

        await Like.create({
            post: postId,
            user: userId
        })
        const likesCount = await Like.countDocuments({post: postId})
        console.log({
    success: true,
    liked: true,
    likesCount,
    message: "Post Liked",
});
        return res.json({success: true, liked: true, likesCount, message: "Post Liked",});                                                                                                                                                                                                                                                                                                                                                                                              

    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
    }
}

export const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;

        const likes = await Like.find({
            post: postId,
        }).populate(
            "user",
            "username full_name profile_picture"
        );

        return res.json({
            success: true,
            users: likes.map(like => like.user),
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};