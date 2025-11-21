import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IConversation {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface IConversationDocument
  extends IConversation,
    Document<mongoose.Types.ObjectId> {}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation = mongoose.model<IConversationDocument>(
  "Conversation",
  conversationSchema
);

export default Conversation;
