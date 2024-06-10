const Product = require('../../model/product')
const User = require('../../model/user')
const Order = require('../../model/order')
const {bot } = require('../bot')

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

const end_order = async(chatId,location) => {
    let user = await User.findOne({chatId}).lean()
    let admin = await User.findOne({admin: true}).lean()

    await User.findByIdAndUpdate(user._id,{
        ...user,
        action: 'end_order'
    },{new: true})

    let order = await Order.findOne({
        user: user._id,
        status: 0
    }).populate(['product']).lean()
    if(order){
        await Order.findByIdAndUpdate(order._id,{
            ...order,
            location,
            status: 1
        },{new : true})

        await bot.sendMessage(chatId,`Your request has been accepted. Our manager will contact you soon`,{
            reply_markup: {
                remove_keyboard: true
            }
        })
        await bot.sendMessage(admin.chatId,`New order.\n Customer: ${user.name}\nProduct: ${order.product.title}\n
            Quantity: ${order.count} items\nTotal price: ${order.count * order.product.price} taka`,{
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
            })
    }
}


const change_order = async (chatId,id,status) =>{
    let admin = await User.findOne({chatId}).lean()
    if (admin.admin) {
        let order = await Order.findById(id).populate(['user','product']).lean()
        await Order.findByIdAndUpdate(order._id,{...order, status, createdAt: new Date()},{new : true})
        const msg = status == 2 ? 'Your order has been accepted' : 'Your order has been cancelled'
        await bot.sendMessage(order.user.chatId,msg)
        await bot.sendMessage(chatId,'The order status has changed')
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



