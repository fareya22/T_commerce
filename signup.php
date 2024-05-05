<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);


$botToken = '6625585244:AAEjajRPuCyykK6Obn8f2V2fiZZnjt7mAxI';


$apiUrl = 'https://api.telegram.org/bot' . $botToken . '/';


$update = json_decode(file_get_contents("php://input"), TRUE);

// Check if update is not empty
if (isset($update) && !empty($update)) {
    // Get message data
    $chatID = $update['message']['chat']['id'];
    $message = isset($update['message']['text']) ? $update['message']['text'] : '';

    // Process user commands
    if ($message == '/signup') {
        // Redirect user to signup form
        $signupFormURL = 'http://localhost/spl2withphp/signup_form.html';
        sendMessage($chatID, "Please click the link below to sign up:\n$signupFormURL");
    } elseif ($message == '/login') {
        // Redirect user to login form
        $loginFormURL = 'http://localhost/spl2withphp/login_form.html';
        sendMessage($chatID, "Please click the link below to log in:\n$loginFormURL");
    }
}

// Function to send message to Telegram
function sendMessage($chatID, $message) {
    global $apiUrl;
    $url = $apiUrl . 'sendMessage?chat_id=' . $chatID . '&text=' . urlencode($message);
    file_get_contents($url);
}
?>
