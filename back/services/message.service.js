import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getOrCreateConversation } from "./conversation.service.js";

const toObjId = (id) => new mongoose.Types.ObjectId(id);

export const listMessages = async (conversationId, { limit = 30, before }) => {
  const filter = { conversationId: toObjId(conversationId) };
  if (before) {
    filter.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return messages.reverse();
};

export const sendMessage = async ({ conversationId, senderId, text, peerId }) => {
  let convo;

  if (conversationId) {
    convo = await Conversation.findById(conversationId);
    if (!convo) throw new Error("Conversation not found");
  } else {
    if (!peerId) throw new Error("peerId is required when conversationId is missing");
    convo = await getOrCreateConversation(senderId, peerId);
  }

  const msg = await Message.create({
    conversationId: convo._id,
    senderId: toObjId(senderId),
    text: text?.trim(),
  });

  await Conversation.findByIdAndUpdate(convo._id, {
    lastMessage: {
      text: msg.text,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
    },
    updatedAt: new Date(),
  });

  return msg;
};
