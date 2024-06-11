const { bot } = require('../bot');
const User = require('../../model/user');
const Cart = require('../../model/cart');
const Product = require('../../model/product');

const add_to_cart = async (chatId, productId, quantity) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        const product = await Product.findById(productId).lean();

        if (!product) {
            bot.sendMessage(chatId, 'Product not found.');
            return;
        }
 
        let cart = await Cart.findOne({ user: user._id }); 

        if (!cart) {
            cart = new Cart({
                user: user._id,
                items: [],
                totalAmount: 0
            });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity: quantity,
                totalPrice: product.price * quantity
            });
        }

        // Recalculate totalAmount for the cart
        let totalAmount = 0;
        for (const item of cart.items) {
            if (isNaN(item.totalPrice) || item.totalPrice <= 0) {
                item.totalPrice = item.quantity * product.price;
            }
            totalAmount += item.totalPrice;
        }
        cart.totalAmount = totalAmount;
        //console.log(cart.totalAmount);

        await cart.save();

        bot.sendMessage(chatId, `Added ${quantity} ${product.title}(s) to your cart.`);
        bot.sendMessage(chatId,`Total amount : ${cart.totalAmount}`);
    } catch (e) {
        console.log(e.message);
        bot.sendMessage(chatId, 'An error occurred while adding to the cart.');
    }
};




const view_cart = async (chatId) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        const cart = await Cart.findOne({ user: user._id }).populate('items.product').lean();

        if (!cart || cart.items.length === 0) {
            bot.sendMessage(chatId, 'Your cart is empty.');
            return;
        }

        const list = cart.items.map((item) => [
            {
                text: `${item.product.title} - ${item.quantity} items - ${item.totalPrice} total`,
                callback_data: `delete_cart_item-${item.product._id}`,
            },
        ]);

        const inline_keyboard = [
            ...list,
            [
                {
                    text: `🗑 Clear Cart (Click each item to remove)`, 
                    callback_data: 'clear_cart',
                },
            ],
            [
                { 
                    text: 'Place Order', 
                    callback_data: `order-${cart._id}-${cart.totalAmount}`, 
                },
            ],
        ];

        bot.sendMessage(chatId, 'Your cart items:', {
            reply_markup: {
                remove_keyboard: true,
                inline_keyboard,
            },
        });
    } catch (e) {
        console.log(e.message);
        bot.sendMessage(chatId, 'An error occurred while viewing your cart.');
    }
};


const delete_cart_item = async (chatId, productId) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        const cart = await Cart.findOne({ user: user._id });

        if (!cart) {
            bot.sendMessage(chatId, 'Item not found in your cart.');
            return;
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);

            // Calculate the totalAmount without using reduce
            let totalAmount = 0;
            for (const item of cart.items) {
                totalAmount += item.totalPrice;
            }
            cart.totalAmount = totalAmount;

            await cart.save();

            bot.sendMessage(chatId, 'Item removed from your cart.');
            view_cart(chatId);
        } else {
            bot.sendMessage(chatId, 'Item not found in your cart.');
        }
    } catch (e) {
           console.log(e.message)
         }
};

const clear_cart = async (chatId) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        await Cart.findOneAndUpdate({ user: user._id }, { items: [], totalAmount: 0 });

        bot.sendMessage(chatId, 'Your cart has been cleared.');
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'An error occurred while clearing your cart.');
    }
};

module.exports = {
    add_to_cart,
    view_cart,
    delete_cart_item,
    clear_cart,
};
