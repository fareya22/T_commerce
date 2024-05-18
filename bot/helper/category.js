const { bot } = require('../bot');
const User = require('../../model/user');
 const Category = require('../../model/category')


const {adminKeyboard , userKeyboard} = require ('../menu/keyboard');
// const category = require('../../model/category');


 const get_all_categories = async (msg, page = 1)=>{
        const chatId = msg.from.id
      let user = await User.findOne({chatId}).lean()

      let limit = 5
      let skip = (page - 1)*limit

      /*

      page 1   skip = 0
      page = 2 skip = 5
      page = 3 skip = 10 
      */

      let categories = await Category.find().skip(page).limit(limit).lean()


    console.log(categories)

    let list = categories.map(category =>
        [
            {
                text: category.title,
                callback_data : `category_${category._id}`
            }
        ] 
    )
    console.log(list)
    
    bot.sendMessage(chatId, `Category list: `,{
        reply_markup:{
            remove_keyboard:true,
            inline_keyboard:[
                ...list,
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
      user.admin ?  [
    {
        text : ' Add category',
        callback_data: 'add_category'
    }
] : []
            ]
        }
    })

 }

 const add_category =async (chatId) => {
    let user = await User.findOne({chatId}).lean()

    if(user.admin){
       await User.findByIdAndUpdate(user._id, {
        ...user,
        action: 'add_category'
       },{new:true})

       bot.sendMessage(chatId, 'Add new category name ')
    }  else {
        bot.sendMessage(chatId, `request is not possible`)
    }

 }

 const new_category = async (msg) => {
    const chatId = msg.from.id
    const text = msg.text

    let user = await User.findOne({chatId}).lean()

    if(user.admin && user.action === 'add_category'){

        let newCategory = new Category({
            title: text,
        })
        await newCategory.save()
        await User.findByIdAndUpdate(user._id,{
            ...user,
            action: 'category'
        })
        get_all_categories(msg)

    } else {
        bot.sendMessage(chatId, `request is not possible`)
    }
 }

 const pagination_category = async (chatId,action)=>{
    let user = await User.findOne({chatId}).lean()
    


 }


module.exports = {
    get_all_categories,
    add_category,
    new_category,
    pagination_category
}