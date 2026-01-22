# 4th Sem Project - Job Portal System

A comprehensive Job Portal application built with **Core PHP**, **MySQL**, and **Tailwind CSS**. This system facilitates three user roles: **Job Seekers**, **Employers**, and **Admins**.

---

## 🚀 1. Installation & Setup

### Step 1: Clone the Repository
If you haven't cloned the project yet, run:
```bash
git clone https://github.com/questraj/4th-sem-project-BE.git
Step 2: Update Code
Navigate to the project folder and pull the latest changes:
code
Bash
cd 4th-sem-project-BE
git pull
Step 3: Check PHP Version
Ensure PHP is installed and added to your environment variables:
code
Bash
php -v
Step 4: Database Setup (XAMPP/WAMP)
Open XAMPP and start Apache and MySQL.
Go to http://localhost/phpmyadmin.
Create a new database named jobportal.
Click on the SQL tab and paste the code below to set up the tables.
🗄️ 2. Database Schema (SQL)
Copy and paste this into your SQL terminal in phpMyAdmin:
code
SQL
-- =============================================
-- 1. RESET DATABASE
-- =============================================
DROP DATABASE IF EXISTS jobportal;
CREATE DATABASE jobportal;
USE jobportal;

-- =============================================
-- 2. USERS TABLE (Authentication)
-- =============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('jobseeker','employer','admin') NOT NULL,
  mobile VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reset_code VARCHAR(6) DEFAULT NULL,
  reset_expiry DATETIME DEFAULT NULL
);

-- =============================================
-- 3. PROFILES (Job Seekers & Employers)
-- =============================================

-- A. Job Seekers Profile
CREATE TABLE jobseekers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  first_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  skills TEXT DEFAULT NULL,
  experience VARCHAR(255) DEFAULT NULL,
  education VARCHAR(255) DEFAULT NULL,
  resume_path VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  profile_pic VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- B. Employers Profile
CREATE TABLE employers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_name VARCHAR(255) DEFAULT NULL,
  company_size VARCHAR(50) DEFAULT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 4. JOB LISTINGS
-- =============================================
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  job_type ENUM('Full Time','Part Time','Contract','Freelance') NOT NULL,
  salary VARCHAR(50) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','active','rejected') DEFAULT 'pending',
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);

-- =============================================
-- 5. APPLICATIONS
-- =============================================
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  jobseeker_id INT NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('applied','interview','rejected','hired') DEFAULT 'applied',
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (jobseeker_id) REFERENCES jobseekers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (job_id, jobseeker_id)
);

-- =============================================
-- 6. NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  message TEXT DEFAULT NULL,
  is_read TINYINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 7. DEFAULT ADMIN USER
-- =============================================
-- Email: admin@gmail.com | Password: adminpassword
INSERT INTO users (email, password, role, created_at) VALUES 
('admin@gmail.com', '$2y$10$WE3ZqZ9Cnm.IB48y1l6/nuYKVOtg9ENHbFe8yvsjxsxfLm2odAOIi', 'admin', NOW());
🏃 3. Running the Project
To start the built-in PHP server, open your terminal in the project folder and run:
code
Bash
php -S localhost:8000
Now open your browser and go to:
👉 http://localhost:8000
📂 4. Project Structure
code
Code
/admin          # Admin Dashboard & Logic
/api            # PHP Backend APIs (Login, Register, Jobs, etc.)
/assets         # Images and Icons
/auth           # Login/Register Pages
/css            # Custom Styles
/js             # Global Scripts
/uploads        # User Uploaded Files (Profile Pics/Resumes)
/users          # User Dashboards (Job Seeker / Employer)
index.html      # Landing Page
✨ Features
Authentication: Secure Login/Register with Password Hashing.
Job Seeker: Profile management, Job search, Apply for jobs, View status.
Employer: Post jobs, Manage applicants, Schedule interviews.
Admin: Approve jobs, Manage users, System statistics.
Notifications: Real-time updates on application status.