# 4th Sem Project - Job Portal System

A comprehensive Job Portal application built with **Core PHP**, **MySQL**, and **Tailwind CSS**. This system facilitates three user roles: **Job Seekers**, **Employers**, and **Admins**.

---

## 1. Installation & Setup

### Step 1: Clone the Repository

If you haven't cloned the project yet, run:

```bash
git clone https://github.com/questraj/4th-sem-project-BE.git
```

### Step 2. Update Code

Navigate to the project folder and pull the latest changes:

```bash
cd 4th-sem-project-BE
git pull
```

### Step 3. Check PHP Version

Ensure PHP is installed and added to your environment variables:

```bash
php -v
```

### Step 4: Database Setup (XAMPP/WAMP)

- Open XAMPP and start Apache and MySQL.
- Go to http://localhost/phpmyadmin.
- Create a new database named jobportal.
- Click on the SQL tab and paste the code below - to set up the tables.

## 2. Database Scheme (SQL)

Copy and past this into SQL terminal in phpMyAdmin:

```bash
-- Cleaned Job Portal Database Schema
-- Generation Time: Feb 14, 2026
-- Target: MariaDB/MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Database Setup
CREATE DATABASE IF NOT EXISTS `jobportal`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;
USE `jobportal`;

-- --------------------------------------------------------
-- 2. Table: users
-- Core table for authentication and role management
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('jobseeker', 'employer', 'admin') NOT NULL,
  `mobile` VARCHAR(20) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `reset_code` VARCHAR(6) DEFAULT NULL,
  `reset_expiry` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Table: employers
-- Extends users table for employer-specific profiles
-- --------------------------------------------------------
CREATE TABLE `employers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `company_size` VARCHAR(50) DEFAULT NULL,
  `industry` VARCHAR(100) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_employer_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Table: jobseekers
-- Extends users table for candidate-specific profiles
-- --------------------------------------------------------
CREATE TABLE `jobseekers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `skills` TEXT DEFAULT NULL,
  `experience` VARCHAR(255) DEFAULT NULL,
  `education` VARCHAR(255) DEFAULT NULL,
  `resume_path` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `profile_pic` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_jobseeker_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Table: jobs
-- Job postings created by employers
-- --------------------------------------------------------
CREATE TABLE `jobs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `employer_id` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `job_type` ENUM('Full Time', 'Part Time', 'Contract', 'Freelance') NOT NULL,
  `salary` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `status` ENUM('pending', 'active', 'rejected', 'closed') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `employer_id` (`employer_id`),
  CONSTRAINT `fk_job_employer` FOREIGN KEY (`employer_id`)
    REFERENCES `employers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Table: applications
-- Junction table connecting jobseekers to jobs
-- --------------------------------------------------------
CREATE TABLE `applications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `job_id` INT(11) NOT NULL,
  `jobseeker_id` INT(11) NOT NULL,
  `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `status` ENUM('applied', 'interview', 'rejected', 'hired') DEFAULT 'applied',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_application` (`job_id`, `jobseeker_id`),
  KEY `jobseeker_id` (`jobseeker_id`),
  CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`)
    REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_seeker` FOREIGN KEY (`jobseeker_id`)
    REFERENCES `jobseekers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 7. Table: notifications
-- System alerts for users regarding application status
-- --------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
```

## 3. Running the Project

Start Apache and MySQL in XAMPP.
Open your browser.
Go to the URL matching your folder name in htdocs:

```bash
http://localhost/jobportal/index.html
```

Now open your browser and go to:
👉 http://localhost/jobportal/index.html

## 4. Project structure

```plaintext
/admin          # Admin Dashboard & Logic
/api            # PHP Backend APIs (Login, Register, Jobs, etc.)
/assets         # Images and Icons
/auth           # Login/Register Pages
/css            # Custom Styles
/js             # Global Scripts
/uploads        # User Uploaded Files (Profile Pics/Resumes)
/users          # User Dashboards (Job Seeker / Employer)
    /jobseeker  # Job Seeker Dashboard
    /employer   # Employer Dashboard
index.html      # Landing Page
```

## ✨ Features

- **Authentication:** Secure Login/Register with Password Hashing.
- **Job Seeker:** Profile management, job search, apply for jobs, view status.
- **Employer:** Post jobs, manage applicants, schedule interviews.
- **Admin:** Approve jobs, manage users, system statistics.
- **Notifications:** Real-time updates on application status.
