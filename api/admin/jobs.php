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
    // 1. Fetch Data
    // REMOVED 'e.logo_path' to prevent SQL errors
    $sql = "SELECT 
                j.id, 
                j.title, 
                j.job_type, 
                j.category,
                j.salary,
                j.description,
                j.status, 
                j.created_at, 
                j.location, 
                e.company_name
            FROM jobs j 
            JOIN employers e ON j.employer_id = e.id 
            ORDER BY j.created_at DESC";
            
    $stmt = $pdo->query($sql);
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Data Normalization
    // Ensure 'status' is always lowercase so filters work correctly on frontend
    foreach ($jobs as &$job) {
        $job['status'] = strtolower($job['status'] ?? 'pending');
        // Handle null values for cleaner JSON
        $job['category'] = $job['category'] ?? 'General';
        $job['location'] = $job['location'] ?? 'Remote';
    }

    echo json_encode(["status" => true, "data" => $jobs]);

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>