# Verification for this ZIP

Verified on Node.js 24.19.0.

- `npm run lint`: passed (TypeScript source checks).
- `npm test`: passed, 16 tests including 11 integration subtests and four standalone utility checks, plus their integration parent.
- `npm run build`: passed (production Vite build).
- Chromium browser suite: 3 passed. Desktop student workflow, administrator schedule workflow, and 390-pixel mobile dashboard were tested.

Browser coverage: real password login and cookie session restoration on reload; private bookmark persistence; edit a post deadline; resume keyword score; application tracking and CSV download; local opportunity chat search; create/edit/delete a schedule; calendar download; Escape closes dialogs; mobile page fits viewport; no student-workflow JavaScript page errors.

Backend coverage: demo credential bypass blocked; OTP resend/attempt/expiry limits; duplicate registrations; pending-account restrictions; admin approval/rejection; edit/delete and admin-only ownership controls; per-user bookmarks, notifications and applications; eligibility and expiry enforcement; schedule validation; actual private image upload access; revoked KYC access; valid PDF extraction and invalid PDF rejection; untrusted-origin rejection; missing AI configuration; persistent SQLite records on reopening; logout revocation.

Utility checks: CSV quote/newline handling and formula protection, ICS UIDs/timestamps/escaping/CRLF/UTF-8 folding/duration, keyword matching boundaries and honest zero/no-requirement results, deadline boundaries and invalid dates.

Not verified with external accounts: real SMTP delivery and live Gemini responses (credentials were not supplied). The backend does not simulate those successes. SMTP and AI configuration are required for their live integrations. Image/scanned PDF OCR, biometric matching, video verification and SMS OTP are not included. Identity review uses administrator-approved documents.

Browser test data and credentials are isolated in `tests/ui-server.ts` and are never used by the normal server. Browser downloads and screenshots from internal checks are not included as user data.
