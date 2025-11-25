# Drupal 5 User Export by Role - Summary Report

## Overview
Successfully created and executed a script to query users with specific role IDs from the Drupal 5 legacy database and export their complete data to JSON format.

## Script Details
- **Script Name**: `export-users-by-role.js`
- **Location**: `/data_analysis/export-users-by-role.js`
- **Database**: Drupal 5 (MariaDB) at 10.163.126.26
- **Target Roles**: IDs 4, 5, 6, 7, 8

## Results Summary

### Users Found: 102 total users with target roles

**Role Distribution:**
- **Translator** (Role ID 4): 96 users
- **Forum Moderator** (Role ID 5): 12 users
- **Editor** (Role ID 6): 22 users
- **datacapture** (Role ID 7): 13 users
- **community manager** (Role ID 8): 8 users

**Profile Pictures: 39 users with profile pictures captured**

### Output Files
- **Primary Output**: `users_by_role_export.json` (3,275 lines)
- **Script**: `export-users-by-role.js` (334 lines)

## Data Structure

Each user record includes:
- **Basic Information**: User ID, username, email, status
- **Timestamps**: Account creation, last access, last login (ISO format)
- **Profile Data**: Theme, language, timezone, signature
- **Role Assignments**: Array of roles with both IDs and names
- **User Image**: Path to associated user image (if available)
- **Raw Data**: Safely handled serialized Drupal user data

## Key Features

✅ **Multi-Role Support**: Users can have multiple roles (many users have 2-5 roles)
✅ **Complete Data Extraction**: All user profile fields included
✅ **Picture Path Integration**: Successfully captures user picture paths and MIME types (39 users with pictures)
✅ **Error Handling**: Graceful handling of schema variations
✅ **JSON Output**: Clean, structured data format with metadata
✅ **Database Compatibility**: Works with Drupal 5.x schema structure

## Sample Users
- **Gloria Wendroff** (UID: 5): All 5 roles (Translator, Forum Moderator, Editor, datacapture, community manager)
- **Santhan** (UID: 2): Translator role only
- **Caleb** (UID: 8202): All 5 roles
- **Normand Bourque** (UID: 3909): 4 roles (Translator, Editor, datacapture, community manager)

## Technical Implementation

### Database Queries
- Uses `users` table for core user data
- Joins `users_roles` junction table for role associations
- Joins `role` table for role names
- Joins `files` table for user image paths

### Data Transformation
- Converts Unix timestamps to ISO format
- Parses serialized PHP data safely
- Groups multiple roles per user
- Includes comprehensive metadata

## Usage
```bash
cd data_analysis
npm run export-users-by-role
```

## Files Created
1. `export-users-by-role.js` - Main script
2. `users_by_role_export.json` - Output data
3. `USER_EXPORT_SUMMARY.md` - This summary

The script successfully meets all requirements and provides a comprehensive export of users with the specified role IDs from the Drupal 5 legacy database.