const { bot } = require('./bot');

const User = require('../model/user')

const { start,requestContact } = require('./helper/start');

//const {get_all_users} = require('./helper/users')
 const {get_all_users} = require('./helper/users')
 const {get_all_categories} = require('./helper/category')

bot.on('message', async msg => {
    const chatId = msg.from.id;
    const text = msg.text;

    const user = await User.findOne({chatId}).lean()



    if (text === '/start') { 
        start(msg);
    }

    if(user) {
        if(user.action === 'request_contact' &&  !user.phone){
            requestContact(msg)
        }
        if ( text == 'Users'){
          get_all_users(msg)

        }

        if ( text == 'Catalog'){
            get_all_categories(msg)
  
          }

    }

});
