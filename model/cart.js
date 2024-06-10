const { Schema, model } = require('mongoose');

const cartItem = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const Cart = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [cartItem],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
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


module.exports = model('Cart', Cart);
