import Conversation from "../models/conversation.model.js";
import {
  listMessages,
  sendMessage,
} from "../services/message.service.js";
import { emitToUser } from "../utils/realtime.js";

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
    const { conversationId, senderId, sender, text, peerId } = req.body;
    const sid = senderId || sender;

    const msg = await sendMessage({
      conversationId,
      senderId: sid,
      text,
      peerId,
    });

    const convo = await Conversation.findById(msg.conversationId).select("participants");
    const members = (convo?.participants || []).map(String);

    const payload = {
  _id: String(msg._id),
  conversationId: String(msg.conversationId),
  senderId: String(msg.senderId),
  text: msg.text,
  createdAt: msg.createdAt,
};
for (const uid of members) {
  await emitToUser(req, uid, "message:new", payload);
}

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};
