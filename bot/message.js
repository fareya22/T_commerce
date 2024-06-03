const { bot } = require('./bot');

const User = require('../model/user')

const { start,requestContact } = require('./helper/start');

//const {get_all_users} = require('./helper/users')
 const {get_all_users} = require('./helper/users')
const {get_all_categories,new_category, save_category} = require('./helper/category')

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
         get_all_categories(chatId)
  
   }

   if(user.action === 'add_category'){
    new_category(msg)
   }

   if(user.action === 'edit_category-'){
    save_category(chatId,text)
   }

 }

}); 
