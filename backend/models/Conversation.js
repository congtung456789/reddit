const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        members: {
            type: Array,
        },
        messageCount: {
            type: Number,
            default: 0
        },
        nameGroup: {
            type: String,
        },
        membersRemove:{
            type:Array
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("Conversation", ConversationSchema);
