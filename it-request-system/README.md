# IT Request System

## Overview

This project is an IT Equipment Request System that allows users to submit requests for IT equipment, which are then approved or rejected by HR, HOD, and ITHOD roles. The system includes a frontend interface for submitting requests and dashboards for managing approvals.

## Features

- User-friendly request form with validation and auto-filled HOD email based on department.
- Login pages for different roles: HR, HOD, and Admin.
- Dashboards to view and manage requests with approval and rejection functionality.
- Email notifications sent to relevant parties for approvals.
- Approval links in emails are single-use and disabled after action.
- Submit buttons are disabled after clicking to prevent multiple submissions.
- Loading indicators shown during form submissions and approval actions.

## Technology Stack

- Backend: Node.js with Express.js, MongoDB for data storage.
- Frontend: HTML, CSS, JavaScript.
- Email: Nodemailer for sending emails.

## Setup and Running

1. Clone the repository.
2. Navigate to the `backend` directory.
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables in `.env` file (e.g., PORT, database connection string, email credentials).
5. Start the backend server:
   ```
   npm start
   ```
6. Open the frontend files in a browser or serve them via a static server.

## Usage

- Access the request form via `index.html`.
- Submit IT equipment requests.
- Approvers receive email links to approve or reject requests.
- Approvals update the request status and disable further actions.
- Dashboards provide an overview and management interface for requests.

## Notes

- Submit buttons show a loading spinner and are disabled during submission to prevent duplicate requests.
- Approval links in emails are single-use and become disabled after the first use.
- The system automatically updates dashboards to reflect the latest request statuses.

## Security

- Approval links are validated and disabled after use to prevent unauthorized or repeated actions.
- User inputs are validated on the frontend and backend.
- CORS is configured to allow requests from any origin (adjust as needed for production).

## Contact

For any issues or questions, please contact the project maintainer.
