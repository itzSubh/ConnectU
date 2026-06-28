import { Inngest } from "inngest";
import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";
import sendEmail from "../config/nodeMailer.js";
import Story from "../models/story.model.js";
import Message from "../models/message.models.js";
import Post from "../models/post.model.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "connectu" });

// Inngest function to save user data to a database

const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers:[
        {
        event: "clerk/user.created",
        },
    ],
  },
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url } = event.data
        let username = email_addresses[0].email_address.split('@')[0]

        const user = await User.findOne({username})
        if(user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name? last_name:"",
            profile_picture: image_url,
            username
        }
        await User.create(userData)
    }
)

// Inngest functon to update user data in database

const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers:[
        {
        event: "clerk/user.updated",
        },
    ],
  },
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url } = event.data

        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name? last_name:"",
            profile_picture: image_url,
        }
        await User.findByIdAndUpdate(id,updatedUserData)
    }
)

// delete user form database

const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [
      {
        event: "clerk/user.deleted",
      },
    ],
  },
  async ({ event }) => {
    const { id } = event.data;

    // Delete user
    await User.findByIdAndDelete(id);

    // Delete all posts created by the user
    await Post.deleteMany({ user: id });

    // Delete all stories created by the user
    await Story.deleteMany({ user: id });

    // Delete all messages sent or received by the user
    await Message.deleteMany({
      $or: [
        { from_user_id: id },
        { to_user_id: id },
      ],
    });

    // Delete all connection request documents
    await Connection.deleteMany({
      $or: [
        { from_user_id: id },
        { to_user_id: id },
      ],
    });

    // Remove deleted user from every other user's arrays
    await User.updateMany(
      {},
      {
        $pull: {
          followers: id,
          following: id,
          connections: id,
        },
      }
    );

    return {
      success: true,
      message: "User and related data deleted successfully",
    };
  }
);

// Inngest function to send reminder when a new connection request is added

const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder", triggers: [{event: "app/connection-request"}]},
  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run('send-connection-request-mail', async() => {
        const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
        const subject = `👋 New Connection Request`;
        const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hi ${connection.to_user_id.full_name},</h2>

              <p>
                You have a new connection request from
                ${connection.from_user_id.full_name}
                (@${connection.from_user_id.username})
              </p>

              <p>
                Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a>
                to accept or reject the request
              </p>
              <br/>
              <p>
                Thanks,<br/>
                ConnnectU - Stay Connected
              </p>
        </div>
        `;
        await sendEmail({
            to: connection.to_user_id.email,
            subject,
            body
        })

        return {message: 'Reminder Sent'}
    })


       
    }
);

// Inngest function to delete story after 24 hrs

const deleteStory = inngest.createFunction(
  {
    id: "story-delete",
    triggers:[
        {
        event: "app/story.delete",
        },
    ],
  },
    async ({event, step}) => {
      const { storyId } = event.data;
      const in24Hours = new Date(Date.now() + 24*60*60*1000)
      await step.sleepUntil('wait-for-24-hours', in24Hours)
      await step.run('delete-story', async () => {
        await Story.findByIdAndDelete(storyId)
        return { message: "Story deleted"}
      })
    }
)

const sendNotificationOfUnseenMessages = inngest.createFunction(
  {
    id: "send-unseen-messages-notification",
    triggers:[
        {
        cron: "TZ=America/New_York 0 9 * * *",
        },
    ],
  },
  async ({step}) => {
    const messages = await Message.find({seen: false}).populate('to_user_id');
    const unseenCount = {}

    messages.map(message => {
      unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0) + 1;
    })

for (const userId in unseenCount) {
    const user = await User.findById(userId);
    if (!user) continue;
    const subject = `📩 You have ${unseenCount[userId]} unseen messages`;
    const body = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${user.full_name},</h2>
        <p>
            You have ${unseenCount[userId]} unseen messages
        </p>
        <p>
            Click
            <a href="${process.env.FRONTEND_URL}/messages"
               style="color: #10b981;">
               here
            </a>
            to view them
        </p>
        <br/>
        <p>
            Thanks,<br/>
            PingUp - Stay Connected
        </p>
    </div>
    `;

    // Send email here
    // await sendEmail(user.email, subject, body);
    await sendEmail({
      to:user.email,
      subject,
      body
    })
}
  }
)
 


// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationOfUnseenMessages
];