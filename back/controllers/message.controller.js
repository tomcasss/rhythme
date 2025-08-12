import {
  listMessages,
  sendMessage,
} from "../services/message.service.js";

export const listMessagesController = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 30, before } = req.query; 
    const data = await listMessages(conversationId, { limit: +limit, before });
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting messages" });
  }
};

export const sendMessageController = async (req, res) => {
  try {
    const { conversationId, senderId, text, peerId } = req.body;
    const msg = await sendMessage({ conversationId, senderId, text, peerId });
    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};
