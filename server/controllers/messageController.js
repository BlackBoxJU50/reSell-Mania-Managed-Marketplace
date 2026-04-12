const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { content, assetId } = req.body;
        const message = new Message({
            sender: req.user.id,
            content,
            assetId
        });
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate('sender', 'name phone')
            .populate('assetId', 'title')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
