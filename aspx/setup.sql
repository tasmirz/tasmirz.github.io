-- Portfolio Database Setup Script - Refactored
-- Clean, modern schema with proper project status management
-- Database: portfolio

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT *
FROM sys.databases
WHERE name = 'portfolio')
BEGIN
    CREATE DATABASE portfolio;
END;
GO

USE portfolio;
GO

-- Drop existing tables if they exist (for clean setup)
-- Drop dependents first to avoid foreign key errors
IF OBJECT_ID('ActivityLog', 'U') IS NOT NULL DROP TABLE ActivityLog;
IF OBJECT_ID('ProjectLanguages', 'U') IS NOT NULL DROP TABLE ProjectLanguages;
IF OBJECT_ID('TypewriterTexts', 'U') IS NOT NULL DROP TABLE TypewriterTexts;
IF OBJECT_ID('Skills', 'U') IS NOT NULL DROP TABLE Skills;
IF OBJECT_ID('Projects', 'U') IS NOT NULL DROP TABLE Projects;
IF OBJECT_ID('SkillCategories', 'U') IS NOT NULL DROP TABLE SkillCategories;
IF OBJECT_ID('Profile', 'U') IS NOT NULL DROP TABLE Profile;
IF OBJECT_ID('AdminUsers', 'U') IS NOT NULL DROP TABLE AdminUsers;
IF OBJECT_ID('Messages', 'U') IS NOT NULL DROP TABLE Messages;
GO

-- 1. Profile Table
CREATE TABLE Profile
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Location NVARCHAR(100) NOT NULL,
    Bio NVARCHAR(500) NOT NULL,
    GithubUrl NVARCHAR(200) NULL,
    LinkedinUrl NVARCHAR(200) NULL,
    AboutDescription NVARCHAR(1000) NULL,
    LastUpdated DATETIME DEFAULT GETDATE()
);
GO

-- 2. TypewriterTexts Table
CREATE TABLE TypewriterTexts
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProfileId INT NOT NULL,
    Text NVARCHAR(200) NOT NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    FOREIGN KEY (ProfileId) REFERENCES Profile(Id) ON DELETE CASCADE
);
GO

-- 3. Projects Table with Status Enum
CREATE TABLE Projects
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    ImageUrl NVARCHAR(500) NULL,
    ProjectUrl NVARCHAR(500) NULL,
    GithubUrl NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'InProgress' CHECK (Status IN ('InProgress', 'Active', 'Archived')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    SortOrder INT NOT NULL DEFAULT 0
);
GO

-- 4. ProjectLanguages Table
CREATE TABLE ProjectLanguages
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProjectId INT NOT NULL,
    Language NVARCHAR(100) NOT NULL,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
);
GO

-- 5. SkillCategories Table
CREATE TABLE SkillCategories
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 6. Skills Table
CREATE TABLE Skills
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 0,
    FOREIGN KEY (CategoryId) REFERENCES SkillCategories(Id) ON DELETE CASCADE
);
GO

-- 7. AdminUsers Table
CREATE TABLE AdminUsers
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME NULL
);
GO

-- 8. ActivityLog Table
CREATE TABLE ActivityLog
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Action NVARCHAR(100) NOT NULL,
    TableName NVARCHAR(50) NULL,
    RecordId INT NULL,
    Details NVARCHAR(500) NULL,
    Timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES AdminUsers(Id)
);
GO

-- 9. Messages Table
CREATE TABLE Messages
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NULL,
    Email NVARCHAR(200) NULL,
    Subject NVARCHAR(300) NULL,
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Ensure default admin user exists (password: admin123)
-- BCrypt hash placeholder for 'admin123'
IF NOT EXISTS (SELECT 1
FROM AdminUsers
WHERE Username = 'admin')
BEGIN
    INSERT INTO AdminUsers
        (Username, PasswordHash, Email, IsActive)
    VALUES
        ('admin', '$2a$11$Zq3q3q3q3q3q3q3q3q3q3u', 'admin@portfolio.local', 1);
END
GO
-- Insert or update profile data (from user JSON)

-- Insert or update profile record for the user
IF EXISTS (SELECT 1
FROM Profile
WHERE Email = 'zihad@tuta.io')
BEGIN
    UPDATE Profile
    SET Name = 'Tasmir Hossain Zihad',
        Title = 'Studying CSE @ KUET',
        Location = 'Khulna, Bangladesh',
        Bio = 'Full-Stack Developer passionate about creating innovative solutions.',
        GithubUrl = 'https://github.com/tasmirz',
        LinkedinUrl = 'https://linkedin.com/in/tasmirz',
        AboutDescription = 'I''m always interested in new opportunities and collaborations. Feel free to reach out!',
        LastUpdated = GETDATE()
    WHERE Email = 'zihad@tuta.io';
END
ELSE
BEGIN
    INSERT INTO Profile
        (Name, Title, Email, Location, Bio, GithubUrl, LinkedinUrl, AboutDescription)
    VALUES
        ('Tasmir Hossain Zihad', 'Studying CSE @ KUET', 'zihad@tuta.io', 'Khulna, Bangladesh',
            'Full-Stack Developer passionate about creating innovative solutions.',
            'https://github.com/tasmirz', 'https://linkedin.com/in/tasmirz',
            'I''m always interested in new opportunities and collaborations. Feel free to reach out!');
END
GO

-- Capture the profile id for the typewriter texts (use the latest profile row)
DECLARE @ProfileId INT;
SET @ProfileId = (SELECT TOP 1
    Id
FROM Profile
WHERE Email = 'zihad@tuta.io'
ORDER BY LastUpdated DESC);
-- If a profile was found, replace any existing typewriter texts for idempotent runs
IF @ProfileId IS NOT NULL AND @ProfileId > 0
BEGIN
    -- remove any previous entries for this profile to avoid duplicates when re-running the script
    DELETE FROM TypewriterTexts WHERE ProfileId = @ProfileId;

    INSERT INTO TypewriterTexts
        (ProfileId, Text, DisplayOrder)
    VALUES
        (@ProfileId, 'Tasmir Hossain Zihad', 1),
        (@ProfileId, 'Full-Stack Developer', 2),
        (@ProfileId, 'Problem Solver', 3);
END
GO

-- Insert sample skill categories
-- Insert skill categories from user JSON
INSERT INTO SkillCategories
    (Name, Description, DisplayOrder, SortOrder)
VALUES
    ('Programming', 'Programming languages and core paradigms', 1, 1),
    ('Technology', 'Infrastructure and developer tools', 2, 2),
    ('Software', 'Design and productivity software', 3, 3);
GO

-- Insert skills for each category
DECLARE @ProgrammingId INT = (SELECT Id
FROM SkillCategories
WHERE Name = 'Programming');
DECLARE @TechnologyId INT = (SELECT Id
FROM SkillCategories
WHERE Name = 'Technology');
DECLARE @SoftwareId INT = (SELECT Id
FROM SkillCategories
WHERE Name = 'Software');

INSERT INTO Skills
    (CategoryId, Name, DisplayOrder, SortOrder)
VALUES
    (@ProgrammingId, 'C++', 1, 1),
    (@ProgrammingId, 'C', 2, 2),
    (@ProgrammingId, 'Python', 3, 3),
    (@ProgrammingId, 'PHP', 4, 4),
    (@ProgrammingId, 'SQL', 5, 5),
    (@ProgrammingId, 'CSS', 6, 6),
    (@ProgrammingId, 'JavaScript', 7, 7),
    (@ProgrammingId, 'TypeScript', 8, 8),
    (@TechnologyId, 'Git', 1, 1),
    (@TechnologyId, 'Linux', 2, 2),
    (@TechnologyId, 'Web App Dev', 3, 3),
    (@TechnologyId, 'ASP.NET', 4, 4),
    (@TechnologyId, 'Node.js', 5, 5),
    (@TechnologyId, 'Docker', 6, 6),
    (@SoftwareId, 'Blender', 1, 1),
    (@SoftwareId, 'Inkscape', 2, 2),
    (@SoftwareId, 'Illustrator', 3, 3),
    (@SoftwareId, 'Photoshop', 4, 4),
    (@SoftwareId, 'GIMP', 5, 5),
    (@SoftwareId, 'VS Code', 6, 6);
GO

-- Insert sample projects
-- Insert projects from user JSON
INSERT INTO Projects
    (Name, Description, ImageUrl, ProjectUrl, GithubUrl, Status, SortOrder)
VALUES
    ('kuet-dull-edge', 'Repository for team KUET_dull_edge (Learnathon-By-Geeky-Solutions)', 'https://via.placeholder.com/300x180/504945/fbf1c7?text=kuet-dull-edge', NULL, NULL, 'Active', 1),
    ('Computer Computer', 'A 29-bit, 5-stage pipelined RISC computer with dedicated assembler', 'https://via.placeholder.com/300x180/665c54/fbf1c7?text=Computer+Computer', NULL, NULL, 'Active', 2),
    ('calendar-cse1205', 'Calendar application (likely course assignment)', 'https://via.placeholder.com/300x180/7c6f64/fbf1c7?text=calendar-cse1205', NULL, NULL, 'Active', 3),
    ('rpg-cse1206', 'HTML-based RPG game (likely course assignment)', 'https://via.placeholder.com/300x180/3c3836/fbf1c7?text=rpg-cse1206', NULL, NULL, 'Active', 4),
    ('Strassen-and-Closest-Pair-Point-Algorithm-Analysis', 'Analysis of Strassen''s matrix multiplication and closest-pair point-set algorithms', 'https://via.placeholder.com/300x180/282828/fbf1c7?text=Strassen-and-Closest-Pair-Point-Algorithm-Analysis', NULL, NULL, 'Active', 5),
    ('Terra', 'Interactive application collecting data from NASA landslide, real-time precipitation, slope, and terrain sources', 'https://via.placeholder.com/300x180/458588/fbf1c7?text=Terra', NULL, NULL, 'Active', 6);
GO

-- Insert project languages for each project
-- Insert project languages safely by selecting project ids from Projects
INSERT INTO ProjectLanguages
    (ProjectId, Language)
SELECT p.Id, v.Language
FROM (VALUES
        ('kuet-dull-edge', 'TypeScript'),
        ('Computer Computer', 'Jupyter Notebook'),
        ('calendar-cse1205', 'C++'),
        ('rpg-cse1206', 'HTML'),
        ('Strassen-and-Closest-Pair-Point-Algorithm-Analysis', 'Jupyter Notebook'),
        ('Terra', 'JavaScript')
) AS v(ProjectName, Language)
    INNER JOIN Projects p ON p.Name = v.ProjectName;
GO
GO

PRINT 'Database setup completed successfully!';
