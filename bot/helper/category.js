const { bot } = require('../bot');
const User = require('../../model/user');
const Category = require('../../model/category')


const {adminKeyboard , userKeyboard} = require ('../menu/keyboard');
const category = require('../../model/category');


const get_all_categories = async (msg)=>{
    const chatId = msg.from.id
    let user = await User.findOne({chatId}).lean()

    let categories = await Category.find().lean()


    console.log(categories)
    
    bot.sendMessage(chatId, `Category list: `,{
        reply_markup:{
            remove_keyboard:true,
            inline_keyboard:[
                [{
                    text : ' Back',
                    callback_data: 'back_category'
                },
            {
                text: '1',
                callback_data: '0'
            },
        {
            text : ' Next',
            callback_data: 'next_category'
        } ],
        [
    {
        text : ' Add category',
        callback_data: 'add_category'
    }
]
            ]
        }
    })

}


module.exports = {
    get_all_categories
}