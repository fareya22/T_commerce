const { bot } = require('../bot');
const User = require('../../model/user');
 const Category = require('../../model/category');
 const Product = require('../../model/product')



const {adminKeyboard , userKeyboard} = require ('../menu/keyboard');
// const category = require('../../model/category');


 const get_all_categories = async (chatId, page = 1)=>{
        /* const chatId = msg.from.id */
      let user = await User.findOne({chatId}).lean()

      let limit = 5;
      let skip = (page - 1)*limit;
      console.log('page',page);
      if(page == 1){
        await User.findByIdAndUpdate(user._id,{...user,action:'category-1'},{new:true})
      }

      /*

      page 1   skip = 0
      page = 2 skip = 5
      page = 3 skip = 10 
      */

      let categories = await Category.find().skip(page).limit(limit).lean()


    //console.log(categories);

    let list = categories.map(category =>
        [
            {
                text: category.title,
                callback_data : `category_${category._id}`
            }
        ] 
    );
    //console.log(list);
    
    bot.sendMessage(chatId, `Category list: `,{
        reply_markup:{
            remove_keyboard:true,
            inline_keyboard:[
                ...list,
                [{
                    text : ' Back',
                    callback_data: page > 1 ? 'back_category' : page,
                },
            {
                text: page,
                callback_data: '0'
            },
        {
            text : ' Next',
            callback_data: limit == categories.length ? 'next_category': page ,
        } ,
    ],
      user.admin ?  [
    {
        text : ' Add category',
        callback_data: 'add_category'
    }
] : [],
            ],
        },
    });

 };

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
        get_all_categories(chatId)

    } else {
        bot.sendMessage(chatId, `request is not possible`)
    }
 }

 const pagination_category = async (chatId,action)=>{
    let user = await User.findOne({chatId}).lean()
    let page = 1 
    //console.log(user.action);

    if(user.action.includes('category-')){
        page = +user.action.split('-')[1]
        console.log(page);
        if(action == 'back_category' && page > 1){
            page--
        }
    } 
        if ( action == 'next_category'){
            page++
        }
        

        await User.findByIdAndUpdate(user._id,{...user,action:`category-${page}`},{new:true})
        get_all_categories(chatId,page);
  

    /*  ( ei tukur logic bad dite pari)
    next_category -5
    prev_category - 6 
    category - 1 -> ['category' , '1']

    if(category-) split(-) 1 -> next_category ++ prev_category --
 */


 }

 const show_category = async ( chatId , id, page = 1 ) => {
    let category = await Category.findById(id).lean()
    let user = await User.findOne({chatId}).lean()
    let limit = 5;
    let skip = (page - 1)*limit;
    let products = await Product.find({category: category._id}).skip(skip).limit(limit).lean()
    
    let list = products.map(product =>
        [
            {
                text: product.title,
                callback_data : `product_${product._id}`
            }
        ] 
    )

    bot.sendMessage(chatId, `${category.title} Products in the Category :  `,{
        reply_markup:{
            remove_keyboard:true,
            inline_keyboard:[
                ...list,
         [
            {
                    text : ' Back',
                    callback_data: page > 1 ? 'back_product' : page,
            },
            {
                text: page,
                callback_data: '0'
            },
        {
            text : ' Next',
            callback_data: limit == products.length ? 'next_product': page ,
        } ,
        ],
    user.admin 
        ? 
         [
        {
            text : ' Add Product',
            callback_data: `add_product_${category._id}`
        }
        ],
    [
        {
            text: 'Edit Category',
            callback_data: `edit_category-${category._id}`
        }
    ],
    : [],
                ],
            },
        },
    );

    };


module.exports = {
    get_all_categories,
    add_category,
    new_category,
    pagination_category,
    show_category,
}