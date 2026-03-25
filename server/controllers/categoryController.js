const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name, bnName } = req.body;
        const category = new Category({ name, bnName });
        await category.save();
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
