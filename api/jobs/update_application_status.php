<?php
session_start();
header("Content-Type: application/json");
require '../db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'employer') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$app_id = $data['app_id'] ?? null;
$new_status = strtolower(trim($data['status'] ?? ''));

$allowed_statuses = ['interview', 'rejected', 'hired'];
if (!$app_id || !is_numeric($app_id) || !in_array($new_status, $allowed_statuses, true)) {
    echo json_encode(["status" => false, "message" => "Invalid request data"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM employers WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $employer = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$employer) {
        echo json_encode(["status" => false, "message" => "Employer not found"]);
        exit;
    }

    $authStmt = $pdo->prepare(
        "SELECT a.id, a.jobseeker_id, j.id AS job_id, j.title, u.id AS user_id
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN jobseekers js ON a.jobseeker_id = js.id
         JOIN users u ON js.user_id = u.id
         WHERE a.id = ? AND j.employer_id = ?"
    );
    $authStmt->execute([$app_id, $employer['id']]);
    $application = $authStmt->fetch(PDO::FETCH_ASSOC);

    if (!$application) {
        echo json_encode(["status" => false, "message" => "Application not found"]);
        exit;
    }

    $updateStmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
    $updateStmt->execute([$new_status, $app_id]);

    $notificationTitle = "Application status updated";
    $notificationMessage = "Your application for '" . $application['title'] . "' is now marked as " . ucfirst($new_status) . ".";

    $notifyStmt = $pdo->prepare(
        "INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, 0)"
    );
    $notifyStmt->execute([$application['user_id'], $notificationTitle, $notificationMessage]);

    echo json_encode([
        "status" => true,
        "message" => "Application marked as " . ucfirst($new_status),
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => false, "message" => "Server Error"]);
}
?>
