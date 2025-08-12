import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";

const toObjId = (id) => new mongoose.Types.ObjectId(id);

export const listUserConversations = async (userId) => {
  const uid = toObjId(userId);
  const convos = await Conversation
    .find({ participants: uid })
    .sort({ updatedAt: -1 })
    .populate("participants", "username email profilePicture")
    .lean();

  return convos;
};

export const getOrCreateConversation = async (userA, userB) => {
  const a = toObjId(userA);
  const b = toObjId(userB);

  let convo = await Conversation.findOne({
    participants: { $all: [a, b] },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [a, b],
      lastMessage: null,
    });
  }
  await convo.populate("participants", "username email profilePicture");
  return convo;
};
