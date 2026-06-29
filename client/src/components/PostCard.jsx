import React, { useState } from 'react'
import moment from 'moment'
import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import { dummyUserData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useRef } from "react";
import LikesModal from './LikeModal'


const PostCard = ({post}) => {
    if (!post.user) {
        return null;
    }

    const postWithHashtags = post.content?.replace(
        /(#\w+)/g,
        '<span class="text-indigo-600">$1</span>'
    );


    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isLiked, setIsLiked] = useState(post.liked);

    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);

    const currentUser = useSelector(state => state.user.value);
    const { getToken } = useAuth()
    const timer = useRef();
    const handleLike = async () => {
        try {
            const { data } = await api.post(`/api/post/like`, { postId: post._id}, {headers: {Authorization: `Bearer ${await getToken()}`}
            })
            console.log(data);
            
            if(data.success){
                toast.success(data.message)
                setIsLiked(data.liked);
                setLikesCount(data.likesCount)
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const fetchLikes = async () => {

    try {

        const { data } = await api.get(
            `/api/post/${post._id}/likes`,
            {
                headers: {
                    Authorization: `Bearer ${await getToken()}`
                }
            }
        );

        if (data.success) {
            setLikedUsers(data.users);
            setShowLikesModal(true);
        }

    } catch (error) {
        toast.error(error.message);
    }

};
const startLongPress = () => {

    timer.current = setTimeout(() => {
        fetchLikes();
    }, 500);

};

const cancelLongPress = () => {
    clearTimeout(timer.current);
};
    const navigate = useNavigate();
      return (
        <>
        <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
            {/* User Info */}
            <div onClick= { () => navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
                <img src={post.user.profile_picture} className='w-10 h-10 rounded-full shadow'/>
                <div>
                    <div className='flex items-center space-x-1'>
                        <span>{post.user.full_name}</span>
                        <BadgeCheck className='w-4 h-4 text-blue-500' />
                    </div>

                    <div>
                        @{post.user.username} • {moment(post.createdAt).fromNow()}
                    </div>
                </div>
            </div>
            {/* Content */}

            {post.content && <div className='text-gray-800 text-sm whitespace-pre-line' dangerouslySetInnerHTML={{__html: postWithHashtags}} />}

            {/* Images */}
            <div className='grid grid-cols-2 gap-2'>
                {post.image_urls.map((img, index) => (
                    <img src={img} key = {index} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} alt="" />
                ))}
            </div>
            {/* Actions */}
            <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
            
                <div className='flex items-center gap-1'>
<div
    onMouseDown={startLongPress}
    onMouseUp={cancelLongPress}
    onMouseLeave={cancelLongPress}
    onTouchStart={startLongPress}
    onTouchEnd={cancelLongPress}
>
    <Heart
        onClick={handleLike}
        className={`w-5 h-5 cursor-pointer ${
            isLiked
                ? "text-red-500 fill-red-500"
                : ""
        }`}
    />
</div>
                   <span>{likesCount}</span>
                </div>

                {/* <div className='flex items-center gap-1'>
                  <MessageCircle className='w-4 h-4' />
                  <span>{12}</span>
                </div>

                <div className='flex items-center gap-1'>
                  <Share2 className='w-4 h-4' />
                  <span>{7}</span>
                </div> */}

            </div>

        </div>
                    <LikesModal
    open={showLikesModal}
    users={likedUsers}
    onClose={() => setShowLikesModal(false)}
/>
        </>
        
  )
}

export default PostCard
