const {Schema,model } = require ('mongoose')

const Order = new Schema ({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    Product:{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    },
    count: Number,
    location: {
        latitude: Number,
        longitude: Number
    },
    createdAt: Date,
    status:{
        type:Number,
        default: 0
    }
});

/*
 0=unfinished
 1=during the check
 2=received
 3=canceled
*/

module.exports = model('Order',Order)