# Complete Testing Guide - After Charan Branch Merge

## 🚀 Development Server Status
- **Frontend**: http://localhost:5173 ✅
- **Backend**: http://localhost:3001 ✅
- **Email Server**: Gmail SMTP configured ✅
- **Payment**: Razorpay integration added ✅

---

## 📋 Test Checklist

### Phase 1: Authentication & Login

#### Test 1.1: Parent Login (DEV MODE)
1. Navigate to http://localhost:5173/login
2. Click "Parent" quick access button (DEV_MODE)
   - Email: `parent@example.com`
   - Auto-login should work
3. **Expected**: Redirect to `/parent` dashboard
4. **Verify**: Dark mode toggle works, sidebar displays
5. ✅ **Pass/Fail**: _______

#### Test 1.2: Coach Login (DEV MODE)
1. Go back to http://localhost:5173/login
2. Click "Coach" quick access button
   - Email: `coach@coach.com`
   - Auto-login should work
3. **Expected**: Redirect to `/coach` dashboard
4. **Verify**: Coach-specific navigation visible
5. ✅ **Pass/Fail**: _______

#### Test 1.3: Admin Login (DEV MODE)
1. Go back to http://localhost:5173/login
2. Click "Admin" quick access button
   - Email: `indianchessacademy@chess.com`
   - Auto-login should work
3. **Expected**: Redirect to `/admin` dashboard
4. **Verify**: Admin panel with all menu options
5. ✅ **Pass/Fail**: _______

---

### Phase 2: Demo Booking Flow

#### Test 2.1: Parent Books Demo
1. **Logout** and navigate to http://localhost:5173/demo-booking
2. Fill in form:
   - Parent Name: `Test Parent`
   - Email: `testparent@gmail.com` ⚠️ **Use a real email you can check**
   - Phone: `+91-9876543210`
   - Student Name: `Test Student`
   - Age: `10`
   - Skill Level: `Beginner`
   - Preferred Date: Pick tomorrow
   - Preferred Time: Pick any slot
   - Message: `Testing the system`
3. Click "Confirm Booking"
4. **Expected**: Redirect to `/demo-confirmation`
5. **Verify**:
   - ✅ Demo record created in Firestore
   - ✅ Check browser console: `✅ Demo request confirmation email sent to: testparent@gmail.com`
   - ✅ **Check your email**: Confirmation should arrive with demo details
6. ✅ **Pass/Fail**: _______

**Email Content Should Include:**
```
Subject: ✅ Demo Request Confirmed - Test Student | Indian Chess Academy

Dear Test Parent,

Thank you for booking a free demo session! 🎉

📋 Your Demo Request Details:
• Student Name: Test Student
• Preferred Date: [Your selected date]
• Preferred Time: [Your selected time]
• Demo ID: [ID]

What Happens Next:
1. Our admin team will review...
```

---

### Phase 3: Admin Demo Management

#### Test 3.1: View Pending Demos
1. **Login as Admin**
2. Navigate to **Demos** page
3. Filter to **PENDING** status
4. **Expected**: See the demo from Test 2.1
5. **Verify**: All details displayed correctly
6. ✅ **Pass/Fail**: _______

#### Test 3.2: Assign Coach with Zoom Link
1. Click on the pending demo
2. Click "Assign Coach" button
3. In modal:
   - Select a coach from dropdown
   - Click **"📌 Default Zoom Link"** button
   - Set scheduled date/time to match preferred time
4. Click "Assign Coach"
5. **Expected**:
   - Demo status changes to `SCHEDULED`
   - ✅ Check console: `✅ Demo confirmation email sent`
   - ✅ **Email should be sent to testparent@gmail.com** with Zoom link
6. **Verify Email Contents**:
   ```
   Subject: Demo Class Scheduled - Test Student | Indian Chess Academy

   Dear Test Parent,

   We are excited to confirm your demo class!

   🔗 Join Meeting:
   https://us06web.zoom.us/j/2884373632

   📝 Feedback Form: [Link]
   ```
7. ✅ **Pass/Fail**: _______

#### Test 3.3: Record Demo Outcome
1. Click on the scheduled demo again
2. Click "Record Outcome" button
3. In modal:
   - Demo Outcome: **"Highly Interested"**
   - Recommended Level: **"Beginner"**
   - Recommended Type: **"Group Classes"**
   - Parent Interest: **"Interested - Send Payment Link"**
4. Click "Submit Outcome"
5. **Expected**:
   - Demo status changes to `INTERESTED`
   - ✅ Check console: `✅ Payment link email sent to: testparent@gmail.com`
   - ✅ Email sent to testparent@gmail.com with payment link AND Zoom link
6. **Verify Email Has**:
   - Zoom meeting link
   - Payment link with demoId parameter
   - Subject with ✅ mark
7. ✅ **Pass/Fail**: _______

---

### Phase 4: New Razorpay Payment Feature (NEW!)

#### Test 4.1: Payment Checkout Page
1. **Login as Parent**
2. Navigate to pricing page with demo: http://localhost:5173/pricing?demoId=[demo_id]
3. **Expected**: New Razorpay payment interface
4. **Verify**:
   - Plans displayed correctly
   - Select a plan
   - See Razorpay button (might need test keys configured)
5. ⚠️ **Note**: Razorpay test keys needed in `.env`
6. ✅ **Pass/Fail**: _______

**Environment Setup Needed:**
```
VITE_RAZORPAY_KEY_ID=xxx
VITE_RAZORPAY_KEY_SECRET=xxx
```

---

### Phase 5: Coach Application & Approval (FIXED)

#### Test 5.1: Approve Coach Application
1. **Login as Admin**
2. Go to **Coaches** section
3. Find pending applications
4. Click "Approve" on any pending coach
5. In ApproveCoachModal:
   - Email should be coach's email (not hardcoded anymore)
   - Set password
   - Click "Approve"
6. **Expected**:
   - ✅ Review email recipient: Should be coach's email from application
   - ✅ Check console for: `✅ Coach credentials email sent to: [coach_email]`
7. **Verify Email**:
   - Sent to coach's email (not your personal email)
   - Contains login credentials
   - Contains coach dashboard link
8. ✅ **Pass/Fail**: _______

---

### Phase 6: New Attendance System (NEW!)

#### Test 6.1: Coach Attendance
1. **Login as Coach**
2. Navigate to **Attendance** page (new)
3. **Expected**: Calendar view or attendance tracking UI
4. **Verify**:
   - Can mark attendance for sessions
   - Can view historical attendance
5. ✅ **Pass/Fail**: _______

#### Test 6.2: Admin Attendance Report
1. **Login as Admin**
2. Navigate to **Attendance Report** (new page)
3. **Expected**: Analytics and stats for all coaches
4. **Verify**:
   - Can filter by coach
   - Can view attendance trends
   - Export functionality (if available)
5. ✅ **Pass/Fail**: _______

---

### Phase 7: Lichess Integration (NEW!)

#### Test 7.1: Parent Lichess Page
1. **Login as Parent**
2. Navigate to **Lichess** section
3. **Expected**: Chess board sync interface
4. **Verify**:
   - Can import/sync games from Lichess
   - Can view board position
5. ✅ **Pass/Fail**: _______

#### Test 7.2: Coach Lichess Page
1. **Login as Coach**
2. Navigate to **Lichess** section
3. **Expected**: Coach can view student Lichess stats
4. **Verify**:
   - Student board sync
   - Can provide feedback on games
5. ✅ **Pass/Fail**: _______

---

### Phase 8: Dark Mode Verification

#### Test 8.1: Dark Mode Toggle
1. Go to any page (admin/coach/parent)
2. Look for **dark mode toggle** (usually top-right)
3. Click to enable dark mode
4. **Expected**: Entire interface switches to dark theme
5. **Verify**:
   - Admin panels: Dark background with light text
   - Cards and modals: Properly themed
   - All icons visible
   - No unreadable text
6. ✅ **Pass/Fail**: _______

#### Test 8.2: Dark Mode Persistence
1. Enable dark mode
2. Navigate to different pages
3. **Expected**: Dark mode persists across pages
4. ✅ **Pass/Fail**: _______

---

### Phase 9: Email Fixes Verification

#### Test 9.1: AssignCoachModal Email Fix
- ✅ Email goes to `demo.parentEmail` (not hardcoded)
- ✅ Uses `to:` field (not `email:`)
- **Status**: FIXED ✅

#### Test 9.2: ApproveCoachModal Email Fix
- ✅ Email goes to `coachEmail` (not hardcoded)
- ✅ Uses `to:` field (not `email:`)
- **Status**: FIXED ✅

#### Test 9.3: Demo Booking Confirmation Email
- ✅ Email sent automatically after form submit
- ✅ Goes to entered email in form
- **Status**: NEW FEATURE ✅

---

### Phase 10: Server & Backend

#### Test 10.1: Server Logging
1. Check terminal running dev server
2. **Expected**:
   - Email Server: Gmail SMTP logging
   - Port 3001: Backend endpoint logs
3. Monitor for any errors
4. ✅ **Pass/Fail**: _______

#### Test 10.2: API Endpoints
1. Test email endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/email/send \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com","subject":"Test","text":"Test message"}'
   ```
2. **Expected**: Email service responds
3. ✅ **Pass/Fail**: _______

---

## 🔍 Bug Tracker

| # | Issue | Expected | Actual | Status |
|---|-------|----------|--------|--------|
| 1 | Demo booking email | Goes to entered email | _____ | ____ |
| 2 | Coach assignment email | Goes to parent email | _____ | ____ |
| 3 | Coach approval email | Goes to coach email | _____ | ____ |
| 4 | Zoom link in payment email | Shows meeting link | _____ | ____ |
| 5 | Default Zoom button | Auto-fills link | _____ | ____ |
| 6 | Dark mode admin panels | Properly themed | _____ | ____ |
| 7 | Razorpay checkout | Shows payment page | _____ | ____ |
| 8 | Attendance system | Can mark attendance | _____ | ____ |
| 9 | Lichess integration | Syncs boards | _____ | ____ |
| 10 | Email confirmation | Arrives within 2min | _____ | ____ |

---

## 📝 Notes

- **DEV_MODE**: Enabled - all role detection automatic
- **Firebase**: Connected to teammate's project (vjai-9461b)
- **Email API**: Backend server (http://localhost:3001)
- **Gmail SMTP**: Configured with `charanrajb282004@gmail.com`
- **Razorpay**: Need test API keys in `.env`

## ✅ Final Sign-Off

Once all tests pass, you're ready for:
- [ ] Team review
- [ ] Production deployment
- [ ] User testing
- [ ] Go live!

---

**Happy Testing!** 🚀
