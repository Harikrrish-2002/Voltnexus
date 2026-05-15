const asyncHandler = require('express-async-handler');
const Part = require('../models/Part');

// @desc    Get all parts for a dealer (if dealer) or all parts (if worker)
// @route   GET /api/parts
// @access  Private (Dealer/Worker)
const getParts = asyncHandler(async (req, res) => {
    let parts;
    if (req.user.role === 'Dealer') {
        parts = await Part.find({ dealer: req.user.id });
    } else {
        // Find all parts with stock > 0, populate dealer info
        parts = await Part.find({ stock: { $gt: 0 } }).populate('dealer', 'name email');
    }
    res.status(200).json(parts);
});

// @desc    Add a new spare part
// @route   POST /api/parts
// @access  Private (Dealer)
const createPart = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Dealer') {
        res.status(403);
        throw new Error('Not authorized to add parts');
    }

    const { name, category, price, stock } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const part = await Part.create({
        dealer: req.user.id,
        name,
        category,
        price,
        stock
    });

    res.status(201).json(part);
});

// @desc    Update a spare part
// @route   PUT /api/parts/:id
// @access  Private (Dealer)
const updatePart = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Dealer') {
        res.status(403);
        throw new Error('Not authorized to update parts');
    }

    const part = await Part.findById(req.params.id);

    if (!part) {
        res.status(404);
        throw new Error('Part not found');
    }

    // Check for user ownership
    if (part.dealer.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedPart = await Part.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedPart);
});

// @desc    Delete a spare part
// @route   DELETE /api/parts/:id
// @access  Private (Dealer)
const deletePart = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Dealer') {
        res.status(403);
        throw new Error('Not authorized to delete parts');
    }

    const part = await Part.findById(req.params.id);

    if (!part) {
        res.status(404);
        throw new Error('Part not found');
    }

    // Check for user ownership
    if (part.dealer.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await part.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getParts,
    createPart,
    updatePart,
    deletePart,
};
