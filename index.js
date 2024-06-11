const express = require('express')
const mongoose = require('mongoose')
const app = express()

const User = require('./model/user')
const Order = require('./model/order')
require('dotenv').config()
const axios = require("axios");
require("colors");
const { v4: uuid } = require("uuid");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.json())

const { bot } = require('./bot/bot')
// const { bot } = require('../bot');


async function dev(){
    try{
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser:true
        }).then(() => { console.log('Mongodb Start')})
        .catch((error) => {console.log(error)})
        app.listen(process.env.PORT,()=> {
             console.log('server is running');
        })

        app.post("/callback", async (req, res, next) => {
            const { pay_status, cus_name, cus_phone, cus_email, currency, pay_time, amount, opt_a, opt_b } = req.body;
            
            if(pay_status=='Successful') {
                // db query: TODO
                let order = await Order.findById(opt_a).populate(['product', 'user']).lean()
                bot.sendMessage(order.user.chatId,"Your payment has been confirmed, you will receive your order shortly")

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
            else 
                bot.sendMessage(order,"Your payment has been cancelled, try again")
          });
          

    }catch(error){
        console.log(error)
    }
}


dev()
