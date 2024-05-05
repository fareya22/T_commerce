<?php

$botToken = "6625585244:AAEjajRPuCyykK6Obn8f2V2fiZZnjt7mAxI"; // Replace 'YOUR_BOT_TOKEN' with the token you got from BotFather

// Function to send message using Telegram Bot API
function sendMessage($chat_id, $message) {
    global $botToken;
    $url = "https://api.telegram.org/bot$botToken/sendMessage?chat_id=$chat_id&text=" . urlencode($message);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}

// Function to handle incoming messages
function processMessage($update) {
    $message = $update["message"];
    $chatId = $message["chat"]["id"];
    $text = $message["text"];

    // Handle commands
    switch ($text) {
        case "/start":
            sendMessage($chatId, "Welcome to your bot!");
            break;
        case "/register":
            // Add logic to register user
            sendMessage($chatId, "Registration complete!");
            break;
        case "/login":
            // Add logic to login user
            sendMessage($chatId, "Login successful!");
            break;
        case "/addproduct":
            // Add logic to add product
            sendMessage($chatId, "Product added successfully!");
            break;
        case "/buy":
            // Add logic to buy product
            sendMessage($chatId, "Order placed successfully!");
            break;
        default:
            sendMessage($chatId, "Invalid command. Please use one of the following commands: /start, /register, /login, /addproduct, /buy");
    }
}

// Get updates from Telegram
$update = json_decode(file_get_contents("php://input"), TRUE);
if (isset($update["message"])) {
    processMessage($update);
}

?>



https://api.telegram.org/bot6625585244:AAEjajRPuCyykK6Obn8f2V2fiZZnjt7mAxI/setWebhook?url=https://f908-103-59-39-81.ngrok-free.app