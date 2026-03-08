# 🚀 Quick Start Testing Guide

## ✅ Current Status

**Servers Running:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Gmail SMTP: charanrajb282004@gmail.com (production ready)
- Razorpay: Test credentials configured ✅

**All Changes from Charan Branch Merged:**
- ✅ Razorpay payment integration
- ✅ Attendance tracking system
- ✅ Lichess board sync
- ✅ Firebase improvements
- ✅ Our email fixes included

---

## 🧪 Quick Testing Workflow

### 1️⃣ Test Demo Booking Email (5 min)
```
Action: Parent submits demo request
Email Should Go To: parent's entered email
Expected: ✅ Confirmation with demo details
```

**Test Steps:**
1. Go to http://localhost:5173/demo-booking
2. Fill form with **your real email address** (so you can check)
3. Submit
4. **Check your email inbox** for confirmation

---

### 2️⃣ Test Admin Assignment Email (5 min)
```
Action: Admin assigns coach to demo
Email Should Go To: parent's email (not admin's)
Expected: ✅ Demo class scheduled with Zoom link
```

**Test Steps:**
1. Login as Admin
2. Go to Demos > PENDING
3. Click "Assign Coach"
4. Select coach + default Zoom link
5. **Check email inbox** for scheduling confirmation

---

### 3️⃣ Test Admin Outcome Email (5 min)
```
Action: Admin marks demo as INTERESTED
Email Should Go To: parent's email
Expected: ✅ Payment link + Zoom meeting link
```

**Test Steps:**
1. Click on assigned demo
2. Click "Record Outcome"
3. Select "Highly Interested"
4. Submit
5. **Check email inbox** for payment email with Zoom link

---

### 4️⃣ Test Coach Approval Email (5 min)
```
Action: Admin approves coach application
Email Should Go To: coach's email (not admin's)
Expected: ✅ Login credentials email
```

**Test Steps:**
1. Go to Coach Applications
2. Click "Approve" on any pending coach
3. Set password
4. Submit
5. **Verify email went to coach's email** (not your email)

---

### 5️⃣ Test New Features (10 min)

**Razorpay Payment:**
- Go to `/pricing?demoId=any-id`
- See Razorpay button
- (No need to complete payment, just verify UI loads)

**Attendance System (Coach):**
- Login as Coach
- Find "Attendance" page
- Mark practice/session attendance

**Lichess Integration:**
- Login as Parent or Coach
- Find "Lichess" section
- Verify board sync interface

**Dark Mode:**
- Click toggle (top-right corner)
- Verify all pages properly themed

---

## 🎯 Critical Tests (MUST PASS)

| Test | Expected | Status |
|------|----------|--------|
| Demo email goes to parent email | ✅ Parent gets confirmation | ___ |
| Assignment email includes Zoom | ✅ Parent sees meeting link | ___ |
| Coach approval goes to coach email | ✅ Coach gets credentials | ___ |
| Payment email shows Zoom link | ✅ Parent sees both links | ___ |
| Default Zoom button works | ✅ Pre-fills URL | ___ |
| Dark mode toggles correctly | ✅ All pages themed | ___ |

---

## 📊 Testing Checklist

- [ ] **Phase 1**: Demo booking email works
- [ ] **Phase 2**: Coach assignment email goes to parent
- [ ] **Phase 3**: Demo outcome email includes Zoom + payment links
- [ ] **Phase 4**: Coach approval email goes to coach
- [ ] **Phase 5**: Default Zoom button auto-fills
- [ ] **Phase 6**: Razorpay page loads
- [ ] **Phase 7**: Attendance system accessible
- [ ] **Phase 8**: Lichess pages load
- [ ] **Phase 9**: Dark mode works globally
- [ ] **Phase 10**: No console errors

---

## 🔧 If Something Breaks

**Email not sending:**
1. Check console (F12) for errors
2. Verify `EMAIL_USER` and `EMAIL_APP_PASSWORD` in `server/.env`
3. Check backend terminal for SMTP errors

**Page not loading:**
1. Verify frontend still running: http://localhost:5173
2. Check network tab (F12) for 404s
3. Look for console errors

**Dark mode not applying:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check theme context is loaded

**Razorpay not showing:**
1. Verify `RAZORPAY_KEY_ID` in `server/.env`
2. Check console for missing API key error
3. Reload page and test again

---

## 📞 Server Logs to Monitor

**Backend Terminal** (3001):
```
Watch for:
✅ "Email User: charanrajb282004@gmail.com"
✅ "Email App Password: Provided"
✅ "Server listening on port 3001"
```

**Browser Console** (F12):
```
Watch for:
✅ "Demo request confirmation email sent"
✅ "Payment link email sent"
✅ "Coach credentials email sent"
❌ Any 404 or network errors
```

---

## 🎉 Success Criteria

**All tests pass when:**
1. ✅ Parent receives demo booking confirmation
2. ✅ Parent receives assignment email with Zoom link
3. ✅ Parent receives payment email with both Zoom + payment links
4. ✅ Coach receives approval email with credentials
5. ✅ Admin can assign coaches with one-click Zoom link
6. ✅ Dark mode works across all pages
7. ✅ No console errors in browser
8. ✅ Backend server running without crashes
9. ✅ All new features load without errors
10. ✅ Ready for production deployment

---

## Quick Reference

**Parent Email:** Use your real email when testing
**Default Zoom:** https://us06web.zoom.us/j/2884373632
**Razorpay Test:** Use any amount, it's sandbox mode
**Dark Mode:** Check works on admin, coach, parent dashboards
**Email Delay:** Gmail might take 30 seconds to 5 minutes

---

**Start with Phase 1 (demo booking) and work through each phase in order!** ✅
