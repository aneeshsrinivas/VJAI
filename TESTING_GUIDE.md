# Complete Application Flow Testing Guide

## Overview
This guide walks through the entire parent-to-admin flow as if you are a parent applying for a chess demo and the admin approving it with automated Zoom meeting integration.

## Prerequisites
- Application is running on `http://localhost:5173`
- DEV_MODE is enabled (no Firebase credentials needed)
- Web3Forms API is configured for email sending

## Test Credentials

### Parent Account
- Email: `parent@example.com`
- Role: Parent/Customer

### Admin Account
- Email: `indianchessacademy@chess.com`
- Role: Admin

### Coach Account
- Email: `coach@coach.com`
- Role: Coach

---

## Phase 1: Parent Applies for Demo

### Step 1.1: Navigate to Demo Booking
1. Go to home page
2. Click on "Book a Demo" or navigate to `/demo-booking`
3. Verify the form has these fields:
   - Parent Name
   - Parent Email
   - Parent Phone
   - Student Name
   - Student Age
   - Chess Experience Level
   - Preferred Date & Time
   - Message (optional)

### Step 1.2: Fill Demo Booking Form
1. **Parent Name:** John Doe
2. **Parent Email:** parent@example.com
3. **Parent Phone:** +91-9876543210
4. **Student Name:** Arjun Doe
5. **Student Age:** 10
6. **Chess Experience:** Beginner
7. **Preferred Date & Time:** Select any future date and time
8. **Message:** "Interested in learning chess for my son"

### Step 1.3: Submit Form
1. Click "Submit" or "Request Demo"
2. ✅ Should see confirmation message
3. ✅ Should be redirected to `/demo-confirmation`
4. ✅ Demo record created in Firestore `demos` collection with:
   - Status: `PENDING`
   - parentEmail: `parent@example.com`
   - studentName: `Arjun Doe`
   - createdAt: current timestamp

---

## Phase 2: Admin Views Pending Demo

### Step 2.1: Login as Admin
1. Click "Logout" (if still logged in as parent)
2. Navigate to `/login` or `/admin`
3. Use DEV_MODE quick access button for admin:
   - Email: `indianchessacademy@chess.com`
   - ✅ Should automatically login as admin
   - ✅ Should redirect to `/admin` dashboard

### Step 2.2: Navigate to Demos Page
1. In Admin dashboard, click "Demos" in sidebar
2. Navigate to `/admin/demos`
3. ✅ Should see the demo you created with:
   - Student Name: Arjun Doe
   - Parent: John Doe (parent@example.com)
   - Status: PENDING
   - Preferred DateTime: [Your selected date/time]

---

## Phase 3: Admin Assigns Coach with Zoom Link

### Step 3.1: Open Assign Coach Modal
1. Click on the demo record for Arjun Doe
2. Click "Assign Coach" button
3. ✅ Modal opens showing:
   - Student: Arjun Doe
   - Parent: John Doe (parent@example.com)
   - Preferred Time: [Your selected date/time]

### Step 3.2: Assign Coach and Meeting Link
1. Select a coach from the list (AI-recommended or manual select)
2. **IMPORTANT:** Provide a Zoom meeting link:
   - Example: `https://zoom.us/j/1234567890`
   - Or any valid Zoom/Google Meet URL
3. Set scheduled date/time (should match preferred time)
4. Click "Assign Coach"

### Step 3.3: Verify Assignment
✅ Should see:
- Demo status changed to `SCHEDULED`
- meetingLink stored in Firestore
- Confirmation email sent to parent (check email logs)

---

## Phase 4: Admin Records Demo Outcome as INTERESTED

### Step 4.1: Open Demo Outcome Modal
1. Click on the scheduled demo again
2. Click "Record Outcome" or similar button
3. ✅ Modal opens with form for:
   - Demo Outcome (radio buttons: Attended, No Show, Interested)
   - Recommended Level (Beginner, Intermediate, Advanced)
   - Recommended Student Type (Group Classes, 1-on-1)
   - Parent Interest Level (Interested, Follow-up, Not Interested)
   - Admin Notes (optional)

### Step 4.2: Mark as INTERESTED
1. Select Demo Outcome: **"Highly Interested"**
2. Select Recommended Level: **"Beginner"**
3. Select Recommended Student Type: **"Group Classes"**
4. Select Parent Interest Level: **"Interested - Send Payment Link"**
5. Add optional notes
6. Click "Submit Outcome"

### Step 4.3: Verify Payment Email Sent
✅ Should see:
- Success message / Confetti animation
- Demo status changed to `INTERESTED`
- **Email sent to parent@example.com** with:
  - Subject: "🎓 VJ AI Chess Academy - Complete Arjun's Enrollment"
  - Body includes:
    - Congratulations message
    - **📅 Demo Class Link:** [Your Zoom URL]
    - Payment link to complete enrollment

---

## Phase 5: Verify Email with Zoom Link

### Step 5.1: Check Email Service Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. ✅ Should see: `"✅ Payment link email sent successfully"`

### Step 5.2: Email Content Verification
The email should contain:
```
Dear John Doe,

Thank you for your interest in VJ AI Chess Academy!

We are excited that Arjun showed great potential during the demo session.

📅 **Your Demo Class Link:**
https://zoom.us/j/1234567890

You can join the class using the link above at the scheduled time.

To complete the enrollment and start the chess journey, please click the link below to select a plan and make the payment:

👉 [Payment Link URL]

If you have any questions, feel free to reply to this email or contact our support team.

Best regards,
VJ AI Chess Academy Team
```

---

## Phase 6: Admin Converts to Student (Optional)

### Step 6.1: Open Convert Student Modal
1. Click on the interested demo again
2. Click "Convert to Student" button
3. ✅ Modal opens with student enrollment form

### Step 6.2: Create Student Record
1. Fill in student details (should be pre-populated)
2. Select subscription plan
3. Click "Convert"

### Step 6.3: Verify Student Creation
✅ Should see:
- Demo status changed to `CONVERTED`
- Student record created in `students` collection
- Subscription created in `subscriptions` collection
- Welcome email sent to parent@example.com

---

## Checklist Summary

- [ ] Phase 1: Parent demo request created with PENDING status
- [ ] Phase 2: Admin can view pending demos
- [ ] Phase 3: Admin assigns coach and sets Zoom meeting link
  - [ ] Demo status changes to SCHEDULED
  - [ ] meetingLink stored in Firestore
- [ ] Phase 4: Admin marks outcome as INTERESTED
  - [ ] Demo status changes to INTERESTED
  - [ ] Email triggered automatically
- [ ] Phase 5: Email received with Zoom link included
  - [ ] Subject line is correct
  - [ ] Zoom meeting link is visible
  - [ ] Payment link is included
- [ ] Phase 6 (Optional): Convert to student and verify welcome email

---

## Troubleshooting

### Email Not Sending
1. Check Web3Forms API key in `.env`
2. Check browser console for error messages
3. Verify email service is called with all parameters

### Zoom Link Not in Email
1. Verify `meetingLink` was saved in Firestore when assigning coach
2. Check that meetingLink is being passed to `sendPaymentLinkEmail()`
3. Check browser console logs

### Demo Not Showing in Admin Panel
1. Verify you're logged in as admin (indianchessacademy@chess.com)
2. Check Firestore console to see if demo was created
3. Refresh the page

### Role Detection Issues
1. DEV_MODE should bypass all role checks
2. Admin role is auto-detected from email domain (ends with @chess.com)
3. Parent role is default for other emails

---

## Notes

- All timestamps use server time
- Meeting links must be valid URLs (they won't be validated at this stage)
- Emails are sent via Web3Forms API (may have rate limits on free tier)
- This is a complete test cycle from application to conversion
