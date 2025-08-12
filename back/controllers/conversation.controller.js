import {
  listUserConversations,
  getOrCreateConversation,
} from "../services/conversation.service.js";

export const listUserConversationsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await listUserConversations(userId);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting conversations" });
  }
};

export const getOrCreateConversationController = async (req, res) => {
  try {
    const a = req.body.userA || req.body.userId;
    const b = req.body.userB || req.body.peerId;

    if (!a || !b) {
      return res.status(400).json({ message: "userId/peerId requeridos" });
    }

    const convo = await getOrCreateConversation(a, b);
    res.status(200).json(convo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error opening conversation" });
  }
};