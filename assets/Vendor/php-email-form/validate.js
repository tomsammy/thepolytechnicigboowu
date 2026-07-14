<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer classes
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Gmail credentials
$gmail_username = "jakinorymnexus@gmail.com";
$gmail_app_password = "YOUR_APP_PASSWORD_HERE"; // Replace this with your actual Gmail App Password
$recipient_email = "jakinorymnexus@gmail.com";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo "Please fill in all required fields.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Invalid email address.";
        exit;
    }

    if (preg_match("/[\r\n]/", $email)) {
        http_response_code(400);
        echo "Invalid email header.";
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // SMTP server configuration
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $gmail_username;
        $mail->Password = $gmail_app_password;
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Sender and recipient
        $mail->setFrom($email, $name);
        $mail->addAddress($recipient_email);

        // Email content
        $mail->isHTML(false);
        $mail->Subject = "New Contact Form Submission";
        $mail->Body = "Name: " . htmlspecialchars($name) . "\n";
        $mail->Body .= "Email: " . htmlspecialchars($email) . "\n\n";
        $mail->Body .= "Message:\n" . htmlspecialchars($message) . "\n";

        $mail->send();
        echo "OK";
    } catch (Exception $e) {
        http_response_code(500);
        echo "Mailer Error: " . $mail->ErrorInfo;
    }
} else {
    http_response_code(405);
    echo "Invalid request method.";
}
?>

