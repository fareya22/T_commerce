const express = require('express');
const mongoose = require('mongoose');
const app = express();

const User = require('./model/user');
const Order = require('./model/order');
require('dotenv').config();
const axios = require("axios");
require("colors");
const { v4: uuid } = require("uuid");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.json());

const { bot } = require('./bot/bot');

async function dev() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

        app.post("/callback", async (req, res) => {
            const { pay_status, cus_name, cus_phone, cus_email, currency, pay_time, amount, opt_a } = req.body;

            try {
                let order = await Order.findById(opt_a).populate('user').populate('products.product').lean();
                
                if (!order) {
                    throw new Error('Order not found');
                }

                if (pay_status === 'Successful') {
                    await Order.findByIdAndUpdate(opt_a, { status: 2 });
                    bot.sendMessage(order.user.chatId, "Your payment has been confirmed, you will receive your order shortly");

                    let admin = await User.findOne({ admin: true }).lean();
                    if (!admin) throw new Error('Admin user not found');

                    // Notify the admin
                    bot.sendMessage(admin.chatId, `Payment received for order ID ${opt_a}:\nCustomer Name: ${cus_name}\nAmount: ${amount} ${currency}\nPayment Time: ${pay_time}`);


                    res.render("callback", {
                        title: "Payment Status",
                        pay_status,
                        cus_name,
                        cus_phone,
                        cus_email,
                        currency,
                        pay_time,
                        amount,
                    });
                } else {
                    bot.sendMessage(order.user.chatId, "Your payment was cancelled, please try again");
                    res.render("callback", {
                        title: "Payment Status",
                        pay_status,
                        cus_name,
                        cus_phone,
                        cus_email,
                        currency,
                        pay_time,
                        amount,
                    });
                }
            } catch (error) {
                console.error(`Error in callback route: ${error.message}`);
                res.status(500).send('Internal Server Error');
            }
        });

    } catch (error) {
        console.error(`Error starting server: ${error.message}`);
    }
}

dev();
