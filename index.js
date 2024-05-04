const express = require('express');
const mongoose = require('mongoose');
const TELEGRAM_BOT = require('node-telegram-bot-api')



const app = express();
app.use(express.json())

//model 

const User = require('./model/user')

const PORT = 3000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/Mydb/TeleCommerce'; // Replace 'your_database_name' with  actual database name
const TOKEN = '7168531529:AAGOwDou-SnkawmCJ-t2weH_U3gxpZa_dVA'

const bot = new TELEGRAM_BOT(TOKEN,{
    polling : true
})

bot.on('message', async(msg) =>{
    console.log(msg);
    const chatId = msg.from.id
    const text = msg.text

    if ( text === '/start'){

        let checkUser =  await User.findOne()

        console.log('bot started')
    }
else {
    bot.sendMessage(chatId, `Hello @${msg.from.first_name.toLowerCase()} . Welcome to T_Commerce , U said " ${text.toUpperCase()} "`) }
});

app.use(express.json());

async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected ');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

app.listen(PORT, () => {
    console.log('Server started');
    connectToMongoDB();
});
