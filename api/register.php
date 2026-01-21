<?php
// 1. Headers to allow API access
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

// 2. Get JSON Input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Check if data is empty
if (!$data) {
    echo json_encode(["status" => false, "message" => "No data received"]);
    exit;
}

// 3. Extract Common Data
$role = $data['role'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$mobile = $data['mobile'] ?? '';

// Basic Validation
if (empty($role) || empty($email) || empty($password)) {
    echo json_encode(["status" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    // 4. Check if Email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => false, "message" => "Email already registered"]);
        exit;
    }

    // 5. Start Transaction (Ensures both tables update, or neither does)
    $pdo->beginTransaction();

    // 6. Insert into Users Table
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    
    $sql_user = "INSERT INTO users (email, password, role, mobile) VALUES (?, ?, ?, ?)";
    $stmt_user = $pdo->prepare($sql_user);
    $stmt_user->execute([$email, $hashed_password, $role, $mobile]);
    
    // Get the ID of the new user
    $user_id = $pdo->lastInsertId();

    // 7. Insert into Specific Role Table
    if ($role === 'jobseeker') {
        $first_name = $data['first_name'] ?? '';
        $last_name = $data['last_name'] ?? '';

        $sql_job = "INSERT INTO jobseekers (user_id, first_name, last_name) VALUES (?, ?, ?)";
        $stmt_job = $pdo->prepare($sql_job);
        $stmt_job->execute([$user_id, $first_name, $last_name]);

    } elseif ($role === 'employer') {
        $company_name = $data['company_name'] ?? '';
        $company_size = $data['company_size'] ?? '';
        $industry = $data['industry'] ?? '';
        $location = $data['location'] ?? '';

        $sql_emp = "INSERT INTO employers (user_id, company_name, company_size, industry, location) VALUES (?, ?, ?, ?, ?)";
        $stmt_emp = $pdo->prepare($sql_emp);
        $stmt_emp->execute([$user_id, $company_name, $company_size, $industry, $location]);
    }

    // 8. Commit Transaction
    $pdo->commit();

    echo json_encode(["status" => true, "message" => "Account created successfully!"]);

} catch (Exception $e) {
    // Rollback changes if something went wrong
    $pdo->rollBack();
    echo json_encode(["status" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>