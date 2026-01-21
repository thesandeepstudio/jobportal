<?php
session_start();
header("Content-Type: application/json");
require '../db.php';

// Auth Check: Admin Only
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

try {
    // We fetch from 'jobseekers' table. 
    // Since Admins don't have records in 'jobseekers', they are automatically hidden.
    $sql = "SELECT 
                j.id, 
                j.user_id,
                j.first_name, 
                j.last_name, 
                j.skills, 
                j.experience, 
                j.education,
                j.profile_pic,
                u.email, 
                u.mobile, 
                u.created_at
            FROM jobseekers j
            JOIN users u ON j.user_id = u.id
            ORDER BY u.created_at DESC";
            
    $stmt = $pdo->query($sql);
    $seekers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => true, "data" => $seekers]);

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>