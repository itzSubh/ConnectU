import imagekit from "../config/imagekit.js";
import Message from "../models/message.models.js";

// Create an empty object to store server side Event connections
const connections = {};

// Controller function for the SSE endpoint

export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log('New Client Connected: ', userId);
    
    // Set SSE headers

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    connections[userId] = res

    res.write('log: Connected to SSE stream\n\n')
    req.on('close', () => {
        // remove the client's response object from the connection array
        delete connections[userId];
        console.log('Client disconnected');
        
    })
}

export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text} = req.body;
        const image = req.file;

        let media_url = ''
        let message_type = image ? 'image':'text';

        if(message_type === 'image'){
            const buffer= fs.createReadStream(image.path)
            const response = await imagekit.files.upload({
                            file: buffer,
                            fileName: image.originalname,
                            transformation: {
                                post: [
                                    {
                                        type: "transformation",
                                        value: "q-auto,f-webp,w-1280"
                                    }
                                ]
                            }
                            });
                media_url = response.url;
        }
            const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
            })

            return res.json({ success: true, message})
            // send message to to_user_id using SSE

            const messageWithUserData = await Message.findById(message._id).populate('from_user_id');
            if(connections[to_user_id]){
                connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
            }
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
    }
}

// Get chat messages

export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id }= req.body;

        const messages = await Message.find({
            $or: [
                {from_user_id: userId, to_user_id},
                {from_user_id: to_user_id, to_user_id: userId},
            ]
        }).sort({createdAt: -1})

        await Message.updateMany({from_user_id: to_user_id, to_user_id: userId}, {seen: true})
        return res.json({ success: true, messages })
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
    }
}
 

export const getUserRecentMessages = async( req, res) => {
    try {
        const { userId } = req.auth();
        const messages = (await Message.find({to_user_id: userId}).populate('from_user_id to_user_id')).sort({ createdAt: -1 });

        return res.json({ success: true, messages})
    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message})
    }
}