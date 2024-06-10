const { bot} = require('../bot')
const User = require('../../model/user')
const {adminKeyboard, userKeyboard} = require('../menu/keyboard')


const get_all_users = async (msg) => {
        const chatId = msg.from.id
        let user = await User.findOne({chatId}).lean()
       if (user.admin){
        let users = await User.find().lean()
       
        let list = ''

        users.forEach(user=>{
            list += `${user.name} : ${user.createdAt.toLocaleString()}\n`
        })


        bot.sendMessage(chatId, `Users list is here : 
        ${list}`)
         } else {
        bot.sendMessage(chatId, `request is not possible`, 
        {
    reply_markup: {
    keyboard: userKeyboard,
    resize_keyboard: true
    }
})

 }
 }
module.exports = {
get_all_users
}