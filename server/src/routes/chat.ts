import express from "express";
import { body, param, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import { chatLimiter, strictLimiter } from "../middleware/rateLimiter";
import Conversation, {
    IConversation,
    IConversationDocument,
    IMessage,
} from "../models/Conversation";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText, TextPart } from "ai";

const router = express.Router();
const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});
const validateRequest = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
        });
    }
    next();
};

router.get("/conversations", authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const conversations: IConversationDocument[] | null =
            await Conversation.find({ userId: req.user.id })
                .select("title lastMessageAt createdAt")
                .sort({ lastMessageAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get(
    "/conversations/:id",
    authenticateToken,
    param("id").isMongoId().withMessage("Invalid conversation ID"),
    validateRequest,
    async (req, res) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            const conversation: IConversationDocument | null =
                await Conversation.findOne({
                    _id: req.params.id,
                    userId: req.user.id,
                });

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: "Conversation not found" });
            }

            res.json(conversation);
        } catch (error) {
            console.error("Error fetching conversation:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.post(
    "/conversations",
    authenticateToken,
    body("title").trim(),
    validateRequest,
    async (req, res) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            const { title } = req.body;

            const conversation: IConversationDocument = new Conversation({
                userId: req.user.id,
                title,
                messages: [],
            });

            await conversation.save();

            res.status(201).json(conversation);
        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.put(
    "/conversations/:id",
    authenticateToken,
    param("id").isMongoId().withMessage("Invalid conversation ID"),
    body("title").trim(),
    validateRequest,
    async (req, res) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            const { title } = req.body;

            const conversation: IConversationDocument | null =
                await Conversation.findOneAndUpdate(
                    { _id: req.params.id, userId: req.user.id },
                    { title },
                    { new: true }
                );

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: "Conversation not found" });
            }

            res.json(conversation);
        } catch (error) {
            console.error("Error updating conversation:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.delete(
    "/conversations/:id",
    strictLimiter,
    authenticateToken,
    param("id").isMongoId().withMessage("Invalid conversation ID"),
    validateRequest,
    async (req, res) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            const conversation: IConversationDocument | null =
                await Conversation.findOneAndDelete({
                    _id: req.params.id,
                    userId: req.user.id,
                });

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: "Conversation not found" });
            }

            res.json({ message: "Conversation deleted successfully" });
        } catch (error) {
            console.error("Error deleting conversation:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

const generateConversationTitle = async (
    conversation: IConversation
): Promise<string> => {
    {
        try {
            const userMessage = conversation.messages.map((message) => {
                if (message.role === "user") return message.content;
            });
            const assistantMessage = conversation.messages.map((message) => {
                if (message.role === "assistant") return message.content;
            });
            const titlePrompt: Omit<IMessage, "timestamp">[] = [
                {
                    role: "user",
                    content: `User: ${userMessage}\nAssistanet ${assistantMessage}`,
                },
            ];

            const response = await generateText({
                model: openrouter.chat("openai/gpt-4o-mini"),
                system: "Generate a short, meaningful conversation title (max 6 words).",
                messages: titlePrompt,
                temperature: 0.2,
                maxRetries: 5,
            });

            const content: TextPart = response.steps[0].response.messages[0]
                .content[0] as TextPart;

            // Return new title with quotes stripped
            return content.text.replace(/^"(.*)"$/, "$1").trim();
        } catch (err) {
            console.error("Error while generating title - ", err);
            return "New Conversation";
        }
    }
};

router.post(
    "/conversations/:id/messages",
    chatLimiter,
    authenticateToken,
    param("id").isMongoId().withMessage("Invalid conversation ID"),
    body("message"),
    validateRequest,
    async (req, res) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ message: "User not authenticated" });
            }

            const { message } = req.body;
            const conversationId = req.params.id;

            const conversation: IConversationDocument | null =
                await Conversation.findOne({
                    _id: conversationId,
                    userId: req.user.id,
                });

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: "Conversation not found" });
            }

            const userMessage = {
                role: "user" as const,
                content: message,
                timestamp: new Date(),
            };

            const isFirstMessage: boolean = conversation.messages.length == 0;

            conversation.messages.push(userMessage);
            conversation.lastMessageAt = new Date();

            const aiMessages = conversation.messages
                .filter((msg) => msg.role === "user")
                .map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }));

            res.setHeader("Content-Type", "text/plain");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            try {
                const result = streamText({
                    model: openrouter.chat("openai/gpt-oss-120b"),
                    system: `You are a senior marketing expert at Virallens, a cutting-edge marketing technology company specializing in performance marketing and AI video solutions for educational institutions.

Your expertise includes:
- Performance marketing strategies and campaign optimization
- AI-powered video content creation and marketing
- Digital marketing for schools, colleges, and universities
- Educational sector marketing trends and best practices
- Data-driven marketing analytics and insights
- Social media marketing for educational institutions
- Content marketing and brand storytelling
- Marketing automation and lead generation

Communication style:
- Professional, polish, yet approachable and friendly in English language
- Heavily use unconventional emojis and unicode characters.
- Data-driven with actionable insights
- Educational and informative
- Focused on practical solutions that drive results
- Use industry terminology appropriately but explain complex concepts clearly

Always provide:
- Specific, actionable recommendations
- Real-world examples when relevant
- Best practices backed by industry knowledge
- Strategic thinking that considers both short-term tactics and long-term goals

Remember: You're helping marketers at educational institutions achieve better performance and ROI through innovative marketing strategies and AI-powered solutions.`,
                    messages: aiMessages,
                    temperature: 1,
                    maxRetries: 5000,
                });

                let fullResponse = "";

                for await (const delta of result.textStream) {
                    fullResponse += delta;
                    res.write(delta);
                }

                const aiMessage = {
                    role: "assistant" as const,
                    content: fullResponse,
                    timestamp: new Date(),
                };

                conversation.messages.push(aiMessage);
                conversation.lastMessageAt = new Date();

                if (
                    isFirstMessage ||
                    conversation.title === "New Conversation"
                ) {
                    conversation.title = await generateConversationTitle(
                        conversation
                    );
                }

                await conversation.save();

                res.end();
            } catch (aiError) {
                console.error("AI streaming error:", aiError);
                res.write(
                    "Sorry, I encountered an error while processing your message."
                );
                res.end();
            }
        } catch (error) {
            console.error("Error processing message:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

export default router;
