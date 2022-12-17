const Conversation = require("../models/Conversation");
const User = require("../models/User");
const functionUtils = require("../utils/functionUtils");
const conversationController = {
    createConversation: async (req, res) => {
        const user = await User.findById(req.body.receiverId).lean();
        const newConversation = new Conversation({
            members: [req.body.senderId, req.body.receiverId],
            nameGroup: user.username
        });
        try {
            const savedConversation = await newConversation.save();
            res.status(200).json(savedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    getConversation: async (req, res) => {
        try {
            const conversation = await Conversation.find({
                members: {$in: [req.params.userId]},
            });
            res.status(200).json(conversation);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    //GET AVAILABLE CONVERSATION
    getAvailableConversation: async (req, res) => {
        try {
            const conversation = await Conversation.findOne({
                members: {$all: [req.params.first, req.params.second]},
            });
            res.status(200).json(conversation);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    //add user to conversation
    addNewUserToConversation: async (req, res) => {
        try {
            if (req.body.conversationId) {
                const conversation = await Conversation.find({
                    _id: {$in: [req.body.conversationId]},
                }).lean();
                if (conversation) {
                    if (!conversation[0].members.includes(req.body.userAddId)) {
                        let removeMember = [];
                        if (conversation[0].membersRemove){
                            if (conversation[0].membersRemove.includes(req.body.userAddId) && conversation[0].membersRemove.length>0){
                                removeMember = conversation[0].membersRemove.filter((m) => m !== req.body.userAddId);
                            }
                        }
                        const newMembers = [
                            req.body.userAddId,
                            ...conversation[0].members
                        ]
                        Conversation.findOneAndUpdate(
                            {_id: {$in: [req.body.conversationId]}},
                            {
                                members: newMembers,
                                membersRemove:removeMember
                            },
                            {new: true, upsert: true},
                            (error) => {
                                console.log(error);
                            });
                        res.status(200).json("Add member success");
                    } else {
                        res.status(200).json("User already in group");
                    }
                } else {
                    res.status(200).json("Can not find conversation to add user");
                }
            }
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    removeUserFromConversation: async (req, res) => {
        try {
            if (req.body.conversationId) {
                const conversation = await Conversation.find({
                    _id: {$in: [req.body.conversationId]},
                }).lean();
                if (conversation) {
                    let allMember = conversation[0].members;
                    if (allMember.includes(req.body.userRemoveId)) {
                        if (allMember.length > 2) {
                            const newMembersRemove = [];
                            if (conversation[0].membersRemove){
                                if (conversation[0].membersRemove.length <= 0){
                                    newMembersRemove.push(req.body.userRemoveId);
                                }else if (!newMembersRemove.includes(req.body.userRemoveId)){
                                    newMembersRemove.push(req.body.userRemoveId);
                                }
                            }else {
                                newMembersRemove.push(req.body.userRemoveId);
                            }
                            functionUtils.removeItemInArray(allMember, req.body.userRemoveId);
                            Conversation.findOneAndUpdate(
                                {_id: {$in: [req.body.conversationId]}},
                                {
                                    members: allMember,
                                    membersRemove:newMembersRemove
                                },
                                {new: true, upsert: true},
                                (error) => {
                                    console.log(error);
                                });
                            let message = "Remove member success";
                            res.status(200).json(message);
                        } else {
                            let message = "Can't remove member";
                            res.status(400).json(message);
                        }
                    } else {
                        let message = "User can't find in conversation";
                        res.status(400).json(message);
                    }
                } else {
                    let message = "Can not find conversation to add user";
                    res.status(400).json(message);
                }
            }
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    getAllUserInConversation: async (req, res) => {
        try {

            const conversation = await Conversation.find({
                _id: {$in: [req.params.conversationId]},
            }).lean();
            let allMember = conversation[0].members;
            const allUser = await User.find({
                _id: {$in: allMember}
            });
            res.status(200).json(allUser);
        } catch (Err) {
            console.log(Err);
            res.status(500).json(Err);
        }
    },
    changeNameChatGroup: async (req, res) => {
        try {
            Conversation.findOneAndUpdate(
                {_id: {$in: req.body.conversationId}},
                {nameGroup: req.body.conversationName},
                {new: true, upsert: true},
                (error) => {
                    console.log(error);
                }
            );
            return res.status(200).json("Update group name success");
        } catch (err) {
            return res.status(500).json(err);
        }
    }
};

module.exports = conversationController;
