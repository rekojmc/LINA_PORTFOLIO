<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "rekojmcdev@gmail.com";
    $name = strip_tags($_POST['name']);
    $email = strip_tags($_POST['email']);
    $reason = strip_tags($_POST['reason']);
    $message = strip_tags($_POST['message']);

    $subject = "New Contact: " . $reason;
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    $headers = "From: " . $email;

    // Send email
    mail($to, $subject, $body, $headers);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Message Sent | Lina Hernandez</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        .success-wrapper {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background-color: #f5f2ee; /* Nude BG */
        }
        .success-card {
            padding: 40px;
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
    </style>
</head>
<body>
    <div class="success-wrapper">
        <div class="success-card">
            <div class="spinner"></div> <h2 style="font-family: 'Playfair Display'; margin-bottom: 20px;">THANK YOU</h2>
            <p style="margin-bottom: 30px;">Thank you for sending me a message.<br>I will reply to you within 2 business days.</p>
            <a href="../index.html" class="footer-contact-link" style="margin: 0;">RETURN TO SITE</a>
        </div>
    </div>
</body>
</html>