import express from 'express'
import { upload } from '../config/multer.js'
import { addPost, getFeedPosts, getPostLikes, likePost } from '../controllers/post.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const postRouter = express.Router()

postRouter.post('/add', upload.array('images',4), protect, addPost)
postRouter.get('/feed', protect, getFeedPosts)
postRouter.post('/like', protect, likePost)
postRouter.get("/:postId/likes", protect, getPostLikes);

export default postRouter