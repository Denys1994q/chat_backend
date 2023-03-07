import MessageModel from "../models/MessageModel.js";

export const addMessage = async (req, res) => {
    try {
        const { from, to, message } = req.body;

        const doc = new MessageModel({
            message: { text: message },
            users: [from, to],
            sender: from,
        });

        await doc.save();

        res.json({ status: "Message added successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request failed",
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { from, to } = req.body;

        const messages = await MessageModel.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: 1 });

        // щоб бачити які повідомлення від себе 
        const projectMessages = messages.map(msg => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
            };
        });
        // console.log('messages', messages)
        // console.log('projectMsgs', projectMessages)
        res.json(projectMessages);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Request failed",
        });
    }
};
