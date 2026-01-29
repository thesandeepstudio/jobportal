<?php
// 1. Prevent Browser Caching (Keep this, it's important for the data update issue)
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// 2. Safe Session Start (Standard Version)
// We removed the 'ini_set' and 'cookie_params' lines to prevent localhost conflicts
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. Database Connection
$host = 'localhost';
$db   = 'jobportal';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Fix for integer handling
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
} catch (PDOException $e) {
    header("Content-Type: application/json");
    die(json_encode(["status" => false, "message" => "DB Connection Failed"]));
}
?>