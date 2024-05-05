<?php
$botToken = '6625585244:AAEjajRPuCyykK6Obn8f2V2fiZZnjt7mAxI';
$hookUrl = 'https://a2cb-103-59-39-81.ngrok-free.app/webhook.php'; // Change this to the URL of your webhook file

$response = file_get_contents("https://api.telegram.org/bot$botToken/setWebhook?url=$hookUrl");

var_dump($response);
?>
