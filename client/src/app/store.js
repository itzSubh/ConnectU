import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice.js'
import connectionsReducer from './connectionsSlice.js'
import messagesReducer from './messagesSlice.js'
export const store = configureStore({
    reducer: {
        user: userReducer,
        connections: connectionsReducer,
        messages: messagesReducer
    }
})