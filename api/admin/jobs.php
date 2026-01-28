<?php
// 1. Suppress PHP Error display (Logs them instead of printing to screen)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 2. Start Output Buffering (Catches any accidental whitespace or warnings)
ob_start();

session_start();
header("Content-Type: application/json");
require '../db.php';

// 3. Clear Buffer (Ensures no previous output exists)
ob_clean(); 

// Auth Check: Admin Only
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

try {
    // 4. Fetch Data
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

    // 5. Data Normalization
    foreach ($jobs as &$job) {
        $job['status'] = strtolower($job['status'] ?? 'pending');
        $job['category'] = $job['category'] ?? 'General';
        $job['location'] = $job['location'] ?? 'Remote';
    }

    echo json_encode(["status" => true, "data" => $jobs]);

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>