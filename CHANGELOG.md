# Changes from the uploaded project

- Added an Express API and durable SQLite storage; removed in-memory mock state as the live data source.
- Replaced duplicated demo authentication with one shared account form, salted password hashing, HttpOnly sessions, real server-generated email OTP and domain validation.
- Removed hardcoded credential access, email-substring password bypass, demo OTPs and account impersonation.
- Added administrator review for faculty/students and actual private ID/photo uploads. Removed fabricated biometric scores and video-verification claims; replaced them with manual review.
- Linked KYC decisions to account access; rejected documents can be resubmitted.
- Added server-side permissions, input validation, safe HTTP/HTTPS links, file signature/size validation and rate limits.
- Isolated bookmarks/notifications per user; private application views and session revocation on logout.
- Added persistent opportunity mutations, comments, likes, pinning, verification and application tracking. Retained the main dashboard/role interfaces; replaced signup and tool panels to reflect real behavior.
- Added current-year batch options, expired filtering, exact application deadline checks, batch/branch eligibility and minute-based deadline label updates.
- Fixed editing deadlines and added numeric compensation metadata/sorting.
- Added placement event creation, editing, deletion and validated durations.
- Repaired CSV and ICS generation, download URL cleanup and links from notifications/schedule/tracker.
- Added real optional server-side Gemini chat/feedback, honest local search and keyword matching, real PDF text extraction, and explicit resume-sharing consent.
- Added dialog focus/keyboard behavior, clearer errors, reproducible lockfile, cross-platform clean command, configuration documentation and tests.

Implementation choices: SQLite provides a runnable private database without requiring an external account. Email OTP verifies email ownership; the phone field is unverified. Identity verification is manual, not biometric. External AI and mail delivery require the user's service credentials and have not been replaced with simulations.
