const { Schema, model } = require('mongoose');

// Define the CartItem schema
const cartItem = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    }
});

// Define the Cart schema
const Cart = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItem],
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});

// Create and export the Cart model
module.exports = model('Cart', Cart);
