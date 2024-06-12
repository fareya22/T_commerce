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

 const show_dashboard = async (msg) => {
    const chatId = msg.from.id;

    try {
        // Fetch user information from the database
        const user = await User.findOne({ chatId }).lean();

        if (user) {
            // Format the createdAt date
            const createdAt = new Date(user.createdAt).toLocaleString();

            // Prepare the user information message
            const userInfo = `Name: ${user.name}\nPhone: ${user.phone}\nChat ID: ${user.chatId}\nCreated At: ${createdAt} `;

            // Send the user information back to the user
            bot.sendMessage(chatId, userInfo);
        } else {
            // If user is not found, send an error message
            bot.sendMessage(chatId, 'User not found.');
        }
    } catch (error) {
        console.error(`Error showing dashboard: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while fetching your information.');
    }
};

module.exports = {
get_all_users,
show_dashboard

}