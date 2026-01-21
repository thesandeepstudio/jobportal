<?php
session_start();
header("Content-Type: application/json");
require '../db.php';

// Auth Check
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

// Get Data
$data = json_decode(file_get_contents("php://input"), true);
$job_id = $data['job_id'];
$status = $data['status']; // 'active' or 'rejected'

if (!$job_id || !$status) {
    echo json_encode(["status" => false, "message" => "Missing data"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE jobs SET status = ? WHERE id = ?");
    $stmt->execute([$status, $job_id]);

    echo json_encode(["status" => true, "message" => "Job marked as " . $status]);

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "Update failed"]);
}
?>