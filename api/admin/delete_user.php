<?php
session_start();
header("Content-Type: application/json");
require '../db.php';

// Auth Check: Admin Only
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => false, "message" => "User ID required"]);
    exit;
}

try {
    // Prevent deleting yourself (the logged-in admin)
    if ($user_id == $_SESSION['user_id']) {
        echo json_encode(["status" => false, "message" => "You cannot delete yourself!"]);
        exit;
    }

    // DELETE from users table. 
    // (Assuming your DB is set up with ON DELETE CASCADE, this will also 
    // remove them from 'jobseekers', 'employers', and 'applications' tables automatically)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$user_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => true, "message" => "User deleted successfully"]);
    } else {
        echo json_encode(["status" => false, "message" => "User not found"]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>