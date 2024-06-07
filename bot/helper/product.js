const Product = require ('../../model/product')
const User = require ('../../model/user') 
  
const {bot} = require('../bot')

const add_product = async (chatId,category) => {
    console.log(chatId,category);
    const newProduct = new Product({
            category ,
            status: 0
        
    } )


    await newProduct.save()

    let user = await User.findOne({chatId}).lean()
    await User.findByIdAndUpdate(user._id,{
        ...user,
        action :'new_product_title'
    },{new:true})
    bot.sendMessage(chatId,`Enter the name of the new product`)
}    

//const steps =['title','price','img','text']
const steps ={
    'title':{
        action: 'new_product_price',
        text: 'Enter the price of the product'
    },

    'price':{
        action: 'new_product_img',
        text: 'Upload the picture of the product'
    },

    'img':{
        action: 'new_product_text',
        text: 'Enter a brief description of the product'
    }

}

const add_product_next = async (chatId,value,slug) =>{
   let user = await User.findOne({chatId}).lean()
   let product = await Product.findOne({status:0}).lean()

   if(['title','text','price','img'].includes(slug)){
    product[slug] = value
    
    if (slug === 'text'){  
        product.status = 1
        await User.findByIdAndUpdate(user._id,{
            ...user,
            action:'catalog'
        })
        bot.sendMessage(chatId,'A new product has been introduced')

    } else{
        await Use.findByIdAndUpdate(user._id,{
                    ...user,
                    action:steps[slug].action
                })  
                bot.sendMessage(chatId,steps[slug].text)
    }
     

    await Product.findByIdAndUpdate(product._id,
    product,{new:true})
    
    }
}


const clear_draft_product = async() =>{
    let products = await Product.find({status:0}).lean()
    if(products){
        await Promise.all(products.map(async product =>{
            await Product.findByIdAndRemove
            (product._id)
        }))
       
    }
}

const show_product = async(chatId,id,count = 1,message_id = null)=>{
let product = await Product.findById(id).populate(['category']).lean()
let user = await User.findOne(chatId).lean()
const inline_keyboard = [
    [
        {
            text:'➖',
            callback_data: `less_count-${product._id}-${count}` 
        },
        {
            text:count,
            callback_data: count 
        },
        {
            text:'➕',
            callback_data: `more_count-${product._id}-${count}` 
        },

    ],
    user.admin ?

    [
        {
            text: '✏ Edit',
            callback_data: `edit_product-${product._id}`
        },
        
        {
            text: '🗑 Delete',
            callback_data: `del_product-${product._id}`
        },

    ] : [],
    [
        { text: 'Place an order',callback_data: `order-${product._id}-${count}` }
    ]
    // [
    //     {
    //         text: '💳Add to cart',
    //         callback_data: 'add_cart'
    //     }
    // ]

]

if(message_id > 0) {

  bot.editMessageReplyMarkup({inline_keyboard},{chat_id: chatId, message_id})

}else{
    bot.sendPhoto(chatId,product.img,{
        caption: `<br>${product.title}<br>\n 🗃 
        Category: ${product.category.title}\n💸
         Price: ${product.price} TK \n
         Description:\n ${product.text}`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard
                }
    
    })

}
}

const delete_product = async(chatId,id,sure) => {
    let user = await User.findOne(chatId).lean()
    if(user.admin){
        if(sure){
            await Product.findByIdAndDelete(id)
            bot.sendMessage(chatId,`The product was deleted`)
        }
        else{
            bot.sendMessage(chatId,`Do you want to delete the product? `,{
                reply_markup:{
                   inline_keyboard: [
                       [
                              {
                                   text: '❌ No',
                                   callback_data: `catalog`
                               },
       
                               {
                                   text: '🆗 Yes',
                                   callback_data: `rem_product-${id}`
                               }
       
                       ]
                   ]
                }   
               })
        }
    }
    else{
        bot.sendMessage(chatId,`You cannot delete the product!`)
    }
}

module.exports = {
    add_product,
    add_product_next,
    clear_draft_product,
    show_product,
    delete_product
}