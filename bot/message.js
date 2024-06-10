const { bot } = require('./bot');

const User = require('../model/user')

const { start,requestContact } = require('./helper/start');

const {get_all_users} = require('./helper/users')
const {get_all_categories,new_category, save_category} = require('./helper/category')

const {add_product_next} = require('./helper/product'); 
const { end_order } = require('./helper/order');

bot.on('message', async msg => {
    const chatId = msg.from.id;
    const text = msg.text;
    console.log(text)
    const user = await User.findOne({chatId}).lean()



    if (text === '/start') {  
        
      start(msg);
    }

    // if ( user.action === 'order'){
    //   end_order(chatId,msg.text)
    // }

     if(user) {
        if(user.action === 'request_contact' &&  !user.phone){
             requestContact(msg)
        }

     if ( text === 'Users'){
          get_all_users(msg)
          return
        }

    if ( text === 'Catalog'){
         get_all_categories(chatId)
          return
        }

        if ( text === 'Cart'){
          view_cart(chatId)
           return
         }

   if(user.action === 'add_category'){
    new_category(msg)
   }


  //if(user.action === 'view_cart')

  //  if(user.action == 'order') {
  //   console.log("call ashche")
  //  }

   if(user.action === 'edit_category-'){
    save_category(chatId,text)
   }
   
   
   if(user.action.includes('new_product_') && user.action !== 'new_product_img'){
    add_product_next(chatId,text,user.action.split('_')[2])
  }
  if(user.action === 'new_product_img'){
    if(msg.photo){
      add_product_next(chatId,msg.photo.at(-1).file_id,'img')
    }
    else{
      bot.sendMessage(chatId,'Upload a simple image of the product')
    }
  }


 }

}); 
