
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    location: {
        latitude: Number,
        longitude: Number
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

/*
 0=unfinished
 1=during the check
 2=received
 3=canceled
*/

//module.exports = model('Order', Order);
module.exports = mongoose.model('Order',Order);