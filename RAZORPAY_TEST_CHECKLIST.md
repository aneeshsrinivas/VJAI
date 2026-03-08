# Razorpay Payment Integration - Test Flow & Troubleshooting

## Current Flow:
1. **Frontend** → Creates Razorpay order via `/api/razorpay/create-order`
2. **Backend** → Uses Razorpay SDK to create order (returns order ID)
3. **Frontend** → Opens Razorpay checkout modal with order ID
4. **Razorpay Modal** → User completes payment
5. **Frontend** → Receives payment response (payment_id, order_id, signature)
6. **Frontend** → Verifies signature via `/api/razorpay/verify-payment` endpoint
7. **Backend** → Validates HMAC signature using `RAZORPAY_KEY_SECRET`
8. **Frontend** → Saves payment to Firestore & redirects to success page

---

## Potential Issues Found:

### ⚠️ Issue 1: API Endpoint Configuration
**File:** `src/services/razorpayService.js` (Line 8)
```javascript
const API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';
```
**Problem:** Uses `VITE_EMAIL_API_URL` which might not be set correctly.
**Check:** Verify in `src/.env` that `VITE_EMAIL_API_URL=http://localhost:3001` is set.

---

### ⚠️ Issue 2: Environment Variables Not Loaded
**Server:** `server/.env` must have:
```
RAZORPAY_KEY_ID=rzp_test_SMNrVoW2HaH9u9
RAZORPAY_KEY_SECRET=MbKObLWgS8pa4ftkT93BpYc9
```

**Check:** Run `echo $RAZORPAY_KEY_SECRET` to verify backend loaded env vars.

---

### ⚠️ Issue 3: CORS Issues
**Backend** uses `app.use(cors())` but might not allow frontend requests.
**Check:** Browser console for CORS errors when clicking payment button.

---

## Test Checklist:

- [ ] **Step 1: Verify Environment**
  - [ ] Run backend: `npm run dev --prefix server`
  - [ ] Run frontend: `npm run dev:client`
  - [ ] Check backend terminal logs for: "Server listening on port 3001"
  - [ ] Check console for: "Email User: charanrajb282004@gmail.com"

- [ ] **Step 2: Verify API Connectivity**
  - [ ] Open browser DevTools (F12)
  - [ ] Go to `/pricing` and select a plan
  - [ ] Click "Join This Class"
  - [ ] Go to Console tab
  - [ ] Look for fetch requests to `localhost:3001/api/razorpay/create-order`

- [ ] **Step 3: Verify Order Creation**
  - [ ] In Console, check if order is created successfully
  - [ ] Look for logs like: "Creating Razorpay order with amount: 4980"
  - [ ] Should see response with `order.id`

- [ ] **Step 4: Test Payment Flow**
  - [ ] Fill all required fields (Student Name, Parent Name, Email)
  - [ ] Click "Pay with Razorpay" button
  - [ ] Razorpay modal should open
  - [ ] Use test card: `4111 1111 1111 1111`
  - [ ] Expiry: Any future date (e.g., 12/25)
  - [ ] CVV: Any 3 digits (e.g., 123)

- [ ] **Step 5: Verify Payment Success**
  - [ ] After payment, should redirect to `/payment/success`
  - [ ] Should see: "🎉 Payment successful!"
  - [ ] Payment record saved in Firestore `payments` collection
  - [ ] Subscription record saved in `subscriptions` collection

---

## Debug Steps:

### If Order Creation Fails:
1. Check backend logs for: "Razorpay Create Order Error"
2. Verify Razorpay credentials in `server/.env`
3. Check network tab (F12) → Network → GET/POST to `localhost:3001`
4. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct

### If Payment Modal Doesn't Open:
1. Check browser console for: "Razorpay SDK failed to load"
2. Check if `VITE_RAZORPAY_KEY_ID` is correct in `src/.env`
3. Verify https://checkout.razorpay.com/v1/checkout.js is accessible

### If Signature Verification Fails:
1. Check backend logs for: "Razorpay Verify Error"
2. Verify `RAZORPAY_KEY_SECRET` matches exactly
3. Check if signature calculation is correct (order_id|payment_id)

---

## Quick Commands to Test:

```bash
# Test backend endpoint directly
curl -X POST http://localhost:3001/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"amountINR": 4980, "receipt": "test123", "notes": {"test": "true"}}'

# Expected response:
# {"success": true, "order": {id: "...", entity: "order", ...}}
```

---

## Test Card Details (Razorpay Test Mode):

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa | 4111 1111 1111 1111 | 12/25 | 123 |
| Mastercard | 5555 5555 5555 4444 | 12/25 | 123 |

---

## Expected Console Outputs:

**Backend Terminal:**
```
Email User: charanrajb282004@gmail.com
Email App Password: Provided
Server listening on port 3001
```

**Browser Console (Successful Payment):**
```
✅ Demo request confirmation email sent
Payment verification successful
🎉 Payment successful!
```

---

## Root Cause Hypotheses:

1. **Most Likely:** `VITE_EMAIL_API_URL` not set → calls wrong backend
2. **Likely:** Razorpay credentials wrong → order creation fails
3. **Possible:** Signature verification fails → backend rejects payment
4. **Less Likely:** CORS blocking requests → check browser console

