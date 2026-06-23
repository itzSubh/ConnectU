import express from 'express'
import { protect } from '../middleware/auth.middleware.js';
import { acceptConnectionsRequest, discoverUsers, followUser, getUserConnections, getUserData, sendConnectionRequest, unfollowuser, updateUserData } from '../controllers/user.controller.js';
import { upload } from '../config/multer.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData)
userRouter.post('/update', upload.fields([{name: 'profile', maxCount: 1}, {name: 'cover', maxCount:1}]), protect, updateUserData)
userRouter.post('/discover', protect, discoverUsers)
userRouter.post('/follow', protect, followUser)
userRouter.post('/unfollow', protect, unfollowuser)
userRouter.post('/connect', protect, sendConnectionRequest)
userRouter.post('/accept', protect, acceptConnectionsRequest)
userRouter.get('/connections', protect, getUserConnections)

export default userRouter