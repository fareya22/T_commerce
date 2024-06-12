const User = require('../../model/user');
const Cart = require('../../model/cart');
const Order = require('../../model/order');
const { bot } = require('../bot');
const { v4: uuid } = require("uuid");
const axios = require("axios");

const baseUrl = "http://localhost:3005/";

// Ready Order Function
const ready_order = async (chatId, cartId, totalAmount) => {
    try {
        console.log(`Processing order for chatId: ${chatId}, cartId: ${cartId}, totalAmount: ${totalAmount}`);
        
        const user = await User.findOne({ chatId }).lean();
        if (!user) throw new Error('User not found');
        console.log(`Found user: ${user.name}`);

        const orders = await Order.find({ user: user._id, status: 0 }).lean();
        await Promise.all(orders.map(async (order) => {
            await Order.findByIdAndDelete(order._id);
        }));
        console.log(`Deleted unfinished orders for user: ${user.name}`);

        await User.findByIdAndUpdate(user._id, {
            ...user,
            action: 'order'
        }, { new: true });

        const cart = await Cart.findById(cartId).populate('items.product').lean();
        if (!cart) throw new Error('Cart not found');
        console.log(`Found cart for user: ${user.name}`);

        const newOrder = new Order({
            user: user._id,
            products: cart.items.map(item => ({
                product: item.product._id
            })),
            totalAmount,
            status: 0
        });

        const order = await newOrder.save();
        console.log(`Created new order: ${order._id} for user: ${user.name}`);

        bot.sendMessage(chatId, `Send the delivery address to order the products`, {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: 'Send the location',
                            request_location: true,
                            action: `order`
                        }
                    ]
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } catch (error) {
        console.error(`Error in ready_order: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while processing the order.');
    }
};

// End Order Function
const end_order = async (chatId, location) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        const admin = await User.findOne({ admin: true }).lean();
        if (!user) throw new Error('User not found');
        if (!admin) throw new Error('Admin not found');

        await User.findByIdAndUpdate(user._id, {
            ...user,
            action: 'end_order'
        }, { new: true });

        const order = await Order.findOne({
            user: user._id,
            status: 0
        }).populate('products.product').lean();

        if (order && order.products.length > 0) {
            await Order.findByIdAndUpdate(order._id, {
                ...order,
                location,
                status: 1
            }, { new: true });

            await bot.sendMessage(chatId, `Your request has been accepted. Our manager will contact you soon`, {
                reply_markup: {
                    remove_keyboard: true
                }
            });

            const productDetails = order.products.map(p => {
                return `Product: ${p.product.title}`;
            }).join('\n');

            await bot.sendMessage(admin.chatId, `New order.\nCustomer: ${user.name}\n${productDetails}\nTotal price: ${order.totalAmount} taka`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Cancel',
                                callback_data: `cancel_order-${order._id}`
                            },
                            {
                                text: 'Confirm order',
                                callback_data: `success_order-${order._id}`
                            }
                        ],
                        [
                            {
                                text: 'Getting location',
                                callback_data: `map_order-${order._id}`
                            }
                        ]
                    ]
                }
            });
        } else {
            bot.sendMessage(chatId, 'Error: Order not found or products not available.');
        }
    } catch (error) {
        console.error(`Error in end_order: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while processing the order.');
    }
};

const change_order = async (chatId, id, status) => {
    try {
        let admin = await User.findOne({ chatId }).lean();
        if (!admin || !admin.admin) {
            bot.sendMessage(chatId, 'You are not authorized to perform this action');
            return;
        }

        let order = await Order.findById(id).populate('user').populate('products.product').lean();
        if (!order) throw new Error('Order not found');

        let totalAmount = order.totalAmount;
        let cus_name = order.user.name;
        let cus_phone = "01717667736";
        let desc = "Order details";
        let currency = "BDT";
        let cus_email = "someone@gmail.com";

        const formData = {
            cus_name,
            cus_email,
            cus_phone,
            amount: totalAmount,
            tran_id: uuid(),
            signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
            store_id: "aamarpaytest",
            currency,
            desc,
            cus_add1: "53, Gausul Azam Road, Sector-14, Dhaka, Bangladesh",
            cus_add2: "Dhaka",
            cus_city: "Dhaka",
            cus_country: "Bangladesh",
            success_url: `${baseUrl}callback`,
            fail_url: `${baseUrl}callback`,
            cancel_url: `${baseUrl}callback`,
            type: "json",
            opt_a: order._id,
            opt_b: chatId
        };

        try {
            const { data } = await axios.post("https://sandbox.aamarpay.com/jsonpost.php", formData);
            console.log("Aamarpay Response: ", data);
            console.log("Form Data Sent: ", formData);

            if (data.result !== "true") {
                console.error(`Aamarpay Error Response: ${JSON.stringify(data)}`);
                bot.sendMessage(chatId, 'Server error occurred while processing payment');
                return;
            }

            await Order.findByIdAndUpdate(order._id, {
                ...order,
                status,
                createdAt: new Date()
            }, { new: true });

            const msg = status == 2
                ? 'Your order has been accepted, please pay using this URL to complete your order: ' + data.payment_url
                : 'Your order has been cancelled';

            await bot.sendMessage(order.user.chatId, msg);
            await bot.sendMessage(chatId, 'The order status has changed');

        } catch (e) {
            console.error(`Error in payment processing: ${e.message}`);
            console.error("Error Response Data: ", e.response ? e.response.data : 'No response data');
            bot.sendMessage(chatId, 'An error occurred while processing the payment');
        }

    } catch (error) {
        console.error(`Error in change_order: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while changing the order status.');
    }
};



// Show Location Function
const show_location = async (chatId, _id) => {
    try {
        let user = await User.findOne({ chatId }).lean();
        if (user.admin) {
            let order = await Order.findById(_id).lean();
            if (order && order.location) {
                bot.sendMessage(chatId, `Location: Latitude ${order.location.latitude}, Longitude ${order.location.longitude}`);
            } else {
                bot.sendMessage(chatId, 'Location information is not available for this order.');
            }
        } else {
            bot.sendMessage(chatId, `You are not allowed to access this information.`);
        }
    } catch (e) {
        console.log(`Error in show_location: ${e.message}`);
        bot.sendMessage(chatId, 'An error occurred while fetching the location.');
    }
};

module.exports = {
    ready_order,
    end_order,
    show_location,
    change_order
};
