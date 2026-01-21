<?php
// 1. Start Session (Must be the very first thing)
session_start();

// 2. Headers for API access
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

// 3. Get JSON Input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Check if data is received
if (!$data) {
    echo json_encode(["status" => false, "message" => "No data received"]);
    exit;
}

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Basic Validation
if (empty($email) || empty($password)) {
    echo json_encode(["status" => false, "message" => "Email and Password are required"]);
    exit;
}

try {
    // 4. Find user in Database
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 5. Verify User exists AND Password matches
    if ($user && password_verify($password, $user['password'])) {
        
        // --- LOGIN SUCCESS ---

        // Set Server Session Variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['email'] = $user['email'];

        // Send response back to Frontend
        echo json_encode([
            "status" => true,
            "message" => "Login Successful",
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "role" => $user['role']
            ]
        ]);

    } else {
        // --- LOGIN FAILED ---
        echo json_encode(["status" => false, "message" => "Invalid Email or Password"]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>