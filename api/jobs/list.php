<?php
session_start();
header("Content-Type: application/json");
require '../db.php';

try {
    // Fetch ONLY Active Jobs
    $sql = "SELECT j.id, j.title, j.category, j.job_type, j.salary, j.location, j.created_at, e.company_name 
            FROM jobs j 
            JOIN employers e ON j.employer_id = e.id 
            WHERE j.status = 'active' 
            ORDER BY j.created_at DESC";
            
    $stmt = $pdo->query($sql);
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => true, "data" => $jobs]);

} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "DB Error"]);
}
?>