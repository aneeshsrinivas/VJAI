/**
 * razorpayService.js
 * Handles loading the Razorpay Checkout.js script and launching the payment modal.
 * Uses TEST mode key (rzp_test_*). Replace with live key for production.
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere';
const API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';

/**
 * Creates a Razorpay Order through the backend API
 */
export const createRazorpayOrder = async (amountINR, receipt, notes) => {
    const res = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountINR, receipt, notes }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create order');
    return data.order;
};

/**
 * Verifies a Razorpay Payment signature through the backend API
 */
export const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
    const res = await fetch(`${API_URL}/api/razorpay/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature
        }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Payment verification failed');
    return data;
};

/**
 * Dynamically loads the Razorpay Checkout script into the document.
 * Safe to call multiple times - will not duplicate the script tag.
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        // Already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Opens the Razorpay payment modal.
 *
 * @param {Object} options
 * @param {number}  options.amountINR       - Amount in INR (will be converted to paise)
 * @param {string}  options.planName        - Plan name shown in the checkout modal
 * @param {string}  options.parentName      - Prefill name
 * @param {string}  options.parentEmail     - Prefill email
 * @param {string}  options.parentPhone     - Prefill phone (optional)
 * @param {string}  [options.orderId]       - Razorpay order_id from backend (optional in test mode)
 * @param {string}  options.description     - Short payment description
 *
 * @returns {Promise<{razorpay_payment_id, razorpay_order_id, razorpay_signature}>}
 */
export const openRazorpayCheckout = async (options) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
    }

    return new Promise((resolve, reject) => {
        const rzpOptions = {
            key: RAZORPAY_KEY_ID,
            amount: Math.round(options.amountINR * 100), // paise
            currency: 'INR',
            name: 'Indian Chess Academy',
            description: options.description || options.planName,
            image: '/logo.png', // update to your logo path
            order_id: options.orderId || undefined, // optional in test mode without backend
            handler: (response) => {
                // Payment success callback
                resolve({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id || null,
                    razorpay_signature: response.razorpay_signature || null,
                });
            },
            prefill: {
                name: options.parentName || '',
                email: options.parentEmail || '',
                contact: options.parentPhone || '',
            },
            notes: {
                plan: options.planName,
            },
            theme: {
                color: '#0f3460',
                backdrop_color: 'rgba(0,0,0,0.7)',
            },
            modal: {
                ondismiss: () => {
                    reject(new Error('PAYMENT_CANCELLED'));
                },
            },
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on('payment.failed', (response) => {
            reject(new Error(response.error?.description || 'Payment failed'));
        });
        rzp.open();
    });
};
