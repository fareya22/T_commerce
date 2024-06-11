const Product = require('../../model/product')
const User = require('../../model/user')
const Cart = require('../../model/cart')
const Order = require('../../model/order')
const {bot } = require('../bot')
const { v4: uuid } = require("uuid");
const baseUrl = "http://localhost:3005/";
const axios = require("axios");

const ready_order = async(chatId,product,count) =>  {
    let user = await User.findOne({chatId}).lean()
    let orders = await Order.find({user,status: 0}).lean()

    await Promise.all(orders.map(async (order) =>{
        await Order.findByIdAndDelete(order._id)
    }))

    await User.findByIdAndUpdate(user._id,{
        ...user,
        action: 'order'
    },{new: true})

    const newOrder = new Order({
        user: user._id,
        product,
        count,
        status: 0
    })

    const order = await newOrder.save()

    bot.sendMessage(chatId,`Send the delivery address to order the product`,{
        reply_markup: {
            keyboard: [
                [
                    {
                        text:'Send the location',
                        request_location: true,
                        action: `order`
                    }
                ]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
};



const end_order = async (chatId, location) => {
    try {
        let user = await User.findOne({ chatId }).lean();
        let admin = await User.findOne({ admin: true }).lean();

        await User.findByIdAndUpdate(user._id, {
            ...user,
            action: 'end_order'
        }, { new: true });

        let order = await Order.findOne({
            user: user._id,
            status: 0
        }).populate(['product']).lean();

        if (order && order.product) {
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

            await bot.sendMessage(admin.chatId, `New order.\n Customer: ${user.name}\nProduct: ${order.product.title}\n
            Quantity: ${order.count} items\nTotal price: ${order.count * order.product.price} taka`, {
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
            bot.sendMessage(chatId, 'Error: Order not found or product not available.');
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'An error occurred while processing the order.');
    }
};



const change_order = async (chatId,id,status) =>{
    let admin = await User.findOne({chatId}).lean()
    if (admin.admin) {
        let order = await Order.findById(id).populate(['user','product']).lean()
        
        let amount = order.product.price
        let cus_name = order.user.name
        let cus_phone = "01717667736"
        let desc = "kichu ekta"
        let currency = "BDT"
        let cus_email = "someone@gmail.com"

        // const { cus_email, cus_name, cus_phone, amount, desc, currency, } = req.body;
        const formData = {
            cus_name,
            cus_email,
            cus_phone,
            amount,
            tran_id: uuid(),
            signature_key:"dbb74894e82415a2f7ff0ec3a97e4183",
            store_id:"aamarpaytest", // Ensure this matches the store ID provided for sandbox testing
            currency,
            desc,
            cus_add1: "53, Gausul Azam Road, Sector-14, Dhaka, Bangladesh",
            cus_add2: "Dhaka",
            cus_city: "Dhaka",
            cus_country: "Bangladesh",
            success_url: `${baseUrl}callback`,
            fail_url: `${baseUrl}callback`,
            cancel_url: `${baseUrl}callback`,
            type: "json", // This is must required for JSON request
            opt_a: order._id,
            opt_b: chatId
          };
        
          try {
            const { data } = await axios.post("https://sandbox.aamarpay.com/jsonpost.php", formData);
            console.log("Aamarpay Response: ", data, formData);
            
            if (data.result !== "true") {
              return "server error"
            }
            await Order.findByIdAndUpdate(order._id,{...order, status, createdAt: new Date()},{new : true})
            const msg = status == 2 ? 'Your order has been accepted, please pay using this url to complete your order: ' + data.payment_url  : 'Your order has been cancelled'
            await bot.sendMessage(order.user.chatId,msg)
            await bot.sendMessage(chatId,'The order status has changed')
          }catch(e) {
            console.log(e.message)
          }
        

       
    }else{
        bot.sendMessage(chatId,'Its not possible for you')
    }

}

const show_location = async (chatId,_id) => {
    try {
        console.log({chatId, _id})
        let user = await User.findOne({chatId}).lean()
        if (user.admin){
            let order = await Order.findById(_id).lean()
            console.log(order.location)
        bot.sendMessage(chatId,order.location)
        }else{
        await bot.sendMessage(chatId,`You are not allowed to enter this place`)
        }
    }
    catch(e) {
        console.log(e.message)
    }

}

module.exports ={
    ready_order,
    end_order,
    show_location,
    change_order

};





