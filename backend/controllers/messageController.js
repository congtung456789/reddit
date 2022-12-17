const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const minioUtils = require("../utils/minioUtils");
const messageController = {
  createMessage: async (req, res) => {
    const newMsg = new Message(req.body);
    try {
      const savedMsg = await newMsg.save();
      await Conversation.findOneAndUpdate(
        {
          _id: req.body.conversationId,
        },
        {
          $inc: { messageCount: 1 },
        }
      );
      if(savedMsg.isFile){
        let imageUrl = await minioUtils.getFileUrl( process.env.MINIO_BUCKET_MESSAGE, savedMsg.text);
        savedMsg.text = imageUrl;
      }
      res.status(200).json(savedMsg);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  getMessage: async (req, res) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      }).lean();
      console.log(messages);
      for (let i=0;i<messages.length; i++){
        let file = messages[i].isFile;
        if (file){
          let urlImage = await minioUtils.getFileUrl(process.env.MINIO_BUCKET_MESSAGE,messages[i].text);
          messages[i].text = urlImage;
        }
      }
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = messageController;
