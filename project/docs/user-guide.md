# User Guide - Card Operations Insights & Validation System

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [Proposals Management](#proposals-management)
5. [Validation System](#validation-system)
6. [Upload Process](#upload-process)
7. [Reports](#reports)
8. [User Management](#user-management)
9. [Profile Settings](#profile-settings)
10. [Troubleshooting](#troubleshooting)

## Introduction

The Card Operations Insights & Validation System is designed to streamline the management and validation of card proposals. This guide will help you navigate through the system's features and functionalities.

## Getting Started

### Logging In

1. Open your web browser and navigate to the application URL.
2. Enter your username and password on the login screen.
3. Click the "Login" button to access the system.

![Login Screen](../frontend/src/assets/images/login-screen.png)

### Navigation

The main navigation menu is located on the left side of the screen and provides access to all system modules:

- **Dashboard**: Overview of key metrics and recent activities
- **Proposals**: View and manage card proposals
- **Validations**: Review and resolve validation issues
- **Upload**: Import data from spreadsheets
- **Reports**: Generate and export reports
- **Operators**: Manage system users (Admin only)
- **Profile**: Update your user profile and password

## Dashboard

The Dashboard provides a comprehensive overview of the system's key metrics and recent activities.

### Key Metrics

- **Total Proposals**: The total number of proposals in the system
- **Digitized Proposals**: The number of proposals marked as digitized
- **Non-Digitized Proposals**: The number of proposals not yet digitized
- **Validation Issues**: The number of unresolved validation issues

### Charts and Graphs

- **Daily Proposals**: Bar chart showing the number of proposals by day
- **Proposals by Employer**: Pie chart showing the distribution of proposals by employer
- **Proposals by Logo**: Pie chart showing the distribution of proposals by logo
- **Validation Issues by Type**: Bar chart showing the number of validation issues by type

### Recent Activities

The Recent Activities section displays the latest actions performed in the system, including:

- Recent uploads
- Recently resolved validation issues
- Recently digitized proposals

## Proposals Management

The Proposals module allows you to view, search, filter, and manage card proposals.

### Viewing Proposals

1. Click on "Proposals" in the main navigation menu.
2. The system displays a table with all proposals, showing key information such as CPF, name, employer, logo, and status.

### Searching and Filtering

1. Use the search box to find proposals by CPF, name, or registration number.
2. Use the filter options to narrow down the list by:
   - Date range
   - Employer
   - Logo
   - Digitized status

### Proposal Details

1. Click on a proposal row to view its complete details.
2. The details panel shows all information about the proposal, including:
   - Personal information
   - Employment details
   - Status information
   - Validation issues (if any)
   - History of changes

### Updating Proposals

1. In the proposal details panel, click the "Edit" button.
2. Update the necessary fields.
3. Click "Save" to apply the changes.

## Validation System

The Validation System helps identify and resolve discrepancies in proposal data.

### Types of Validations

- **Missing Data**: Fields that are required but missing
- **Data Mismatch**: Inconsistencies between different data sources
- **Duplicate Entry**: Multiple entries with the same key information
- **Invalid Format**: Data that doesn't match the expected format

### Viewing Validation Issues

1. Click on "Validations" in the main navigation menu.
2. The system displays a table with all validation issues, showing the type, message, related proposal, and status.

### Filtering Validation Issues

Use the filter options to narrow down the list by:
- Validation type
- Resolution status
- Date range
- Related proposal information

### Resolving Validation Issues

1. Click on a validation issue row to view its details.
2. Review the issue description and the original data.
3. Click the "Resolve" button.
4. Enter a resolution note explaining how the issue was addressed.
5. Click "Confirm" to mark the issue as resolved.

## Upload Process

The Upload module allows you to import data from various spreadsheet formats.

### Supported File Types

- Excel files (.xlsx, .xls)
- CSV files (.csv)

### Supported Spreadsheet Types

- **PROD_PROM**: Production and promotion data
- **ESTEIRA**: Pipeline data
- **OP_REALIZADAS**: Completed operations
- **SEGUROS**: Insurance data

### Uploading a File

1. Click on "Upload" in the main navigation menu.
2. Click the "Choose File" button or drag and drop your file into the designated area.
3. Select the spreadsheet type from the dropdown menu.
4. Click "Upload" to start the import process.

### Validation Process

After uploading, the system will:
1. Validate the file format and structure
2. Check for required columns
3. Process the data and identify any issues
4. Display a summary of the import results

### Import Results

The import results screen shows:
- Total records processed
- Records successfully imported
- Records with validation issues
- Detailed list of validation issues

## Reports

The Reports module allows you to generate and export data reports in various formats.

### Available Report Types

- **Proposals Summary**: Overview of all proposals with key metrics
- **Validation Issues**: List of all validation issues with status information
- **Operator Performance**: Statistics on operator activities and performance
- **Upload History**: Record of all file uploads with results

### Generating a Report

1. Click on "Reports" in the main navigation menu.
2. Select the report type from the available options.
3. Set the filter criteria:
   - Date range
   - Employer
   - Logo
   - Operator ID
   - Digitized status
4. Select the output format (Excel or PDF).
5. Click "Generate Report" to create the report.

### Exporting Reports

Once generated, reports can be:
- Downloaded as Excel (.xlsx) or PDF files
- Printed directly from the browser
- Shared via email (if configured)

## User Management

The Operators module allows administrators to manage system users.

### Viewing Users

1. Click on "Operators" in the main navigation menu (Admin only).
2. The system displays a table with all users, showing their name, username, email, role, and status.

### Adding a New User

1. Click the "Add Operator" button.
2. Fill in the required fields:
   - Name
   - Username
   - Email
   - Password
   - Admin status
3. Click "Save" to create the new user.

### Editing User Information

1. Click on the edit icon next to the user you want to modify.
2. Update the necessary fields.
3. Click "Save" to apply the changes.

### Deactivating a User

1. Click on the edit icon next to the user you want to deactivate.
2. Toggle the "Active" switch to Off.
3. Click "Save" to apply the change.

## Profile Settings

The Profile module allows users to update their personal information and password.

### Updating Personal Information

1. Click on "Profile" in the main navigation menu.
2. Update your name and email as needed.
3. Click "Save" to apply the changes.

### Changing Password

1. Click on "Profile" in the main navigation menu.
2. Click the "Change Password" tab.
3. Enter your current password.
4. Enter and confirm your new password.
5. Click "Update Password" to apply the change.

## Troubleshooting

### Common Issues

#### Login Problems

- **Issue**: Unable to log in with correct credentials
- **Solution**: 
  - Verify that you're using the correct username and password
  - Check if your account is active (contact an administrator)
  - Clear your browser cache and cookies

#### Upload Failures

- **Issue**: File upload fails or times out
- **Solution**:
  - Verify that the file is in the correct format (.xlsx, .xls, or .csv)
  - Check that the file size is within the allowed limit (10MB)
  - Ensure that the file contains all required columns for the selected type

#### Report Generation Errors

- **Issue**: Unable to generate reports
- **Solution**:
  - Try narrowing down the date range or filter criteria
  - Check if there is data available for the selected filters
  - Try a different output format

### Getting Help

If you encounter issues that aren't covered in this guide:

1. Check the system documentation for additional information
2. Contact your system administrator for assistance
3. Submit a support ticket through the help desk system

---

© 2023 Card Operations Insights & Validation System. All rights reserved.