const { bot } = require('./bot');
const User = require('../model/user');
const Cart = require('../model/cart');
const Product = require('../model/product');
const { add_category, pagination_category, show_category, remove_category, edit_category, get_all_categories } = require('./helper/category');
const { delete_product, add_product, show_product, add_product_next } = require('./helper/product');
const { ready_order, show_location, change_order } = require('./helper/order');
const { add_to_cart,start_add_to_cart, delete_cart_item, clear_cart,process_add_to_cart, } = require('./helper/cart');
const { adminKeyboard, userKeyboard } = require('./menu/keyboard');

bot.on('callback_query', async query => {
    const { data } = query;
    const chatId = query.from.id;

    await bot.answerCallbackQuery(query.id);
    console.log(data);

    if (data === 'add_category') {
        add_category(chatId);
    }

    if (data.includes('map_order-')) {
        let id = data.split('-')[1];
        console.log(id);
        show_location(chatId, id);
        return;
    }

    if (data.includes('success_order-')) {
        let id = data.split('-');
        change_order(chatId, id[1], 2);
        return;
    }

    if (data.includes('cancel_order-')) {
        let id = data.split('-');
        change_order(chatId, id[1], 3);
        return;
    }

    if (data.includes('order-')) {
        let id = data.split('-');
        console.log(id);
        ready_order(chatId, id[1], id[2]);
    }

    if (data.includes('more_count-')) {
        let id = data.split('-');
        show_product(chatId, id[1], +id[2] + 1, query.message.message_id);
    }

    if (data.includes('less_count-')) {
        let id = data.split('-');
        if (id[2] > 1) {
            show_product(chatId, id[1], +id[2] - 1, query.message.message_id);
        }
    }

    if (['next_category', 'back_category'].includes(data)) {
        pagination_category(chatId, data, query.message.message_id);
    }

    if (data.includes('category_')) {
        let id = data.split('_')[1];
        show_category(chatId, id);
    }

    if (data.includes('del_category-')) {
        let id = data.split('-')[1];
        remove_category(chatId, id);
    }

    if (data.includes('edit_category-')) {
        let id = data.split('-')[1];
        edit_category(chatId, id);
    }

    if (data.includes('add_product-')) {
        let id = data.split('-')[1];
        add_product(chatId, id);
    }

    if (data.includes('add_cart-')) {
        let id = data.split('-');
        add_to_cart(chatId, id[1], id[2]);
    }

    // if (data === 'view_cart') {
    //     await view_cart(chatId);
    // }

    // if (data.includes('delete_cart_item-')) {
    //     let id = data.split('-')[1];
    //     await delete_cart_item(chatId, id);
    // }

    // if (data === 'clear_cart') {
    //     await clear_cart(chatId);
    // }

    if (data.includes('product_')) {
        let id = data.split('_')[1];
        show_product(chatId, id);
    }

    if (data.includes('del_product-')) {
        let id = data.split('-')[1];
        delete_product(chatId, id);
    }

    if (data.includes('rem_product-')) {
        let id = data.split('-')[1];
        delete_product(chatId, id, true);
    }

    if (data === 'catalog') {
        get_all_categories(chatId);
    }
});

module.exports = bot;