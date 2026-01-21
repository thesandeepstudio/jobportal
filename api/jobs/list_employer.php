<?php
session_start();
header("Content-Type: application/json");
require '../db.php';

// 1. Auth Check
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'employer') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

try {
    // 2. Get Employer ID
    $stmt = $pdo->prepare("SELECT id FROM employers WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $employer = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$employer) {
        echo json_encode(["status" => false, "message" => "Employer not found"]);
        exit;
    }

    // 3. Get Jobs AND Applicant Count per Job
    $sql = "SELECT j.*, 
            (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicant_count 
            FROM jobs j 
            WHERE j.employer_id = ? 
            ORDER BY j.created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$employer['id']]);
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. [NEW] Calculate Total Applications across ALL jobs
    $sqlCount = "SELECT COUNT(*) 
                 FROM applications a 
                 JOIN jobs j ON a.job_id = j.id 
                 WHERE j.employer_id = ?";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute([$employer['id']]);
    $totalApplicants = $stmtCount->fetchColumn();

    // 5. Send Response
    echo json_encode([
        "status" => true, 
        "data" => $jobs,
        "total_applicants" => $totalApplicants // This is needed for the dashboard card
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>