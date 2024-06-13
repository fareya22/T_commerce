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
        await User.findByIdAndUpdate(user._id,{
                    ...user,
                    action:steps[slug].action
                })  
                bot.sendMessage(chatId,steps[slug].text)
    }
     

    await Product.findByIdAndUpdate(product._id,
    product,{new:true})
    
    }
}


const clear_draft_product = async () => {
    try {
        await Product.deleteMany({ status: 0 });
        console.log('Draft products cleared');
    } catch (error) {
        console.error(`Error clearing draft products: ${error.message}`);
    }
};

const show_product = async (chatId, id, count = 1, message_id = null) => {
    try {
        let product = await Product.findById(id).populate('category').lean();
        let user = await User.findOne({ chatId }).lean();
        const inline_keyboard = [
            [
                {
                    text: '➖',
                    callback_data: `less_count-${product._id}-${count}`
                },
                {
                    text: count,
                    callback_data: count
                },
                {
                    text: '➕',
                    callback_data: `more_count-${product._id}-${count}`
                }
            ],
            user.admin ?
                [
                    {
                        text: '✏ Edit',
                        callback_data: `edit_product-${product._id}` // Here we only include product ID
                    },
                    {
                        text: '🗑 Delete',
                        callback_data: `del_product-${product._id}`
                    }
                ] :
                [
                    {
                        text: '💳 Add to cart',
                        callback_data: `add_cart-${product._id}-${count}`
                    }
                ]
        ];

        if (message_id > 0) {
            bot.editMessageReplyMarkup({ inline_keyboard }, { chat_id: chatId, message_id });
        } else {
            bot.sendPhoto(chatId, product.img, {
                caption: `${product.title}\n🗃 Category: ${product.category.title}\n💸 Price: ${product.price} TK\nDescription: \n${product.text}`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard
                }
            });
        }
    } catch (error) {
        console.error(`Error showing product: ${error.message}`);
    }
};

const delete_product = async (chatId, id, sure) => {
    try {
        let user = await User.findOne({ chatId }).lean();
        if (user.admin) {
            if (sure) {
                await Product.findByIdAndDelete(id);
                bot.sendMessage(chatId, `The product was deleted`);
            } else {
                bot.sendMessage(chatId, `Do you want to delete the product?`, {
                    reply_markup: {
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
                });
            }
        } else {
            bot.sendMessage(chatId, `You cannot delete the product!`);
        }
    } catch (error) {
        console.error(`Error deleting product: ${error.message}`);
    }
};

const edit_product = async (chatId, productId) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        if (!user || !user.admin) {
            bot.sendMessage(chatId, `You are not authorized to perform this action.`);
            return;
        }

        const editKeyboard = [
            [
                { text: 'Name', callback_data: `edit_name-${productId}` },
                { text: 'Price', callback_data: `edit_price-${productId}` }
            ],
            [
                { text: 'Picture', callback_data: `edit_picture-${productId}` },
                { text: 'Description', callback_data: `edit_description-${productId}` }
            ]
        ];

        bot.sendMessage(chatId, `Choose an attribute to edit:`, {
            reply_markup: { inline_keyboard: editKeyboard }
        });
    } catch (error) {
        console.error(`Error in edit_product: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while editing the product.');
    }
};

const edit_name = async (chatId, productId) => {
    try {
        let user = await User.findOne({ chatId }).lean();
        await User.findByIdAndUpdate(user._id, { action: `edit_product_name-${productId}` });
        bot.sendMessage(chatId, `Enter the new name for the product:`);
    } catch (error) {
        console.error(`Error in edit_name: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while initiating the product name edit.');
    }
};


const edit_price = async (chatId, productId) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        
        // Check if user is found
        if (!user) {
            throw new Error('User not found.');
        }

        // Update user's action to indicate editing price for a specific product
        await User.findByIdAndUpdate(user._id, { action: `edit_product_price-${productId}` });
        
        // Prompt user to enter the new price
        bot.sendMessage(chatId, `Enter the new price for the product:`);
    } catch (error) {
        console.error(`Error in edit_price: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while editing the product price.');
    }
};


const edit_picture = async (chatId, productId) => {
    try {
        const user = await User.findOne({ chatId }).lean();

        // Check if user is found
        if (!user) {
            throw new Error('User not found.');
        }

        // Update user's action to indicate editing picture for a specific product
        await User.findByIdAndUpdate(user._id, { action: `edit_product_picture-${productId}` });

        // Prompt user to upload the new picture for the product
        bot.sendMessage(chatId, `Please upload the new picture for the product:`);
    } catch (error) {
        console.error(`Error in edit_picture: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while editing the product picture.');
    }
};



const edit_description = async (chatId, productId) => {
    try {
        const user = await User.findOne({ chatId }).lean();
        
        // Check if user is found
        if (!user) {
            throw new Error('User not found.');
        }

        // Update user's action to indicate editing description for a specific product
        await User.findByIdAndUpdate(user._id, { action: `edit_product_description-${productId}` });
        
        // Prompt user to enter the new description
        bot.sendMessage(chatId, `Enter the new description for the product:`);
    } catch (error) {
        console.error(`Error in edit_description: ${error.message}`);
        bot.sendMessage(chatId, 'An error occurred while editing the product description.');
    }
};



const handle_edit_action = async (chatId, productId, newValue, action) => {
    try {
        const attribute = action.split('_')[2]; // Extract the attribute from the action

        // Map attribute 'name' to 'title' for the product
        const fieldMapping = {
            'name': 'title',
            'price': 'price',
            'picture': 'img',
            'description': 'text'
        };

        // Check if the attribute is valid
        if (!Object.keys(fieldMapping).includes(attribute)) {
            throw new Error('Invalid edit action.');
        }

        // Prepare the update field
        const updateField = { [fieldMapping[attribute]]: newValue };

        // Log the update field
        console.log('Update Field:', updateField);

        // Update the product in the database
        const updatedProduct = await Product.findByIdAndUpdate(productId, updateField, { new: true });

        // Check if the product was successfully updated
        if (!updatedProduct) {
            throw new Error('Product not found or could not be updated.');
        }

        // Log the updated product
        console.log('Updated Product:', updatedProduct);

        // Notify the user about the successful update
        bot.sendMessage(chatId, `Product ${fieldMapping[attribute]} updated successfully.`);
    } catch (error) {
        console.error(`Error in handle_edit_action: ${error.message}`);
        // Notify the user about the error
        bot.sendMessage(chatId, 'An error occurred while updating the product.');
    }
}



module.exports = {
    add_product,
    add_product_next,
    clear_draft_product,
    show_product,
    delete_product,
    edit_product,
    edit_name,
    edit_price,
    handle_edit_action,
    edit_description,
    edit_picture
};



