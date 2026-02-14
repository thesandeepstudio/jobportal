<?php
session_start();
header("Content-Type: application/json");
require '../db.php'; // Note the ../ because it's inside api/admin/

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => false, "message" => "Credentials required"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        
        // --- SECURITY UPDATE: ALLOW ONLY ADMIN ---
        if ($user['role'] !== 'admin') {
            echo json_encode(["status" => false, "message" => "Access Denied. Admins only."]);
            exit;
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = 'admin';
        $_SESSION['email'] = $user['email'];

        echo json_encode([
            "status" => true,
            "message" => "Admin Login Successful",
            "user" => ["role" => "admin"]
        ]);

    } else {
        echo json_encode(["status" => false, "message" => "Invalid Credentials"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "Server Error"]);
}
?>