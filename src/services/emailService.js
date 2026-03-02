/**
 * Email Service using Web3Forms API
 * Free tier: 250 emails/month (sufficient for MVP)
 */

const WEB3FORMS_API_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
const API_ENDPOINT = 'https://api.web3forms.com/submit';

export const emailService = {
    /**
     * Send Demo Request Confirmation email immediately after parent books a demo
     */
    sendDemoRequestConfirmation: async ({ parentEmail, parentName, studentName, preferredDate, preferredTime, demoId }) => {
        try {
            const dashboardLink = `${window.location.origin}/login`;

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_API_KEY,
                    subject: `✅ Demo Request Confirmed - ${studentName} | VJ AI Chess Academy`,
                    from_name: 'VJ AI Chess Academy',
                    to: parentEmail,
                    message: `
Dear ${parentName},

Thank you for booking a free demo session with VJ AI Chess Academy! 🎉

We're excited to help ${studentName} start their chess journey.

📋 **Your Demo Request Details:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Student Name: ${studentName}
• Preferred Date: ${preferredDate}
• Preferred Time: ${preferredTime}
• Demo ID: ${demoId}

⏭️ **What Happens Next:**
1. Our admin team will review your request shortly
2. We'll match ${studentName} with the best coach based on their skill level
3. You'll receive a confirmation email with:
   - Assigned coach details
   - Zoom meeting link
   - Exact demo date & time

📧 **Have Questions?**
If you need any clarification or want to change your preferred time, feel free to reply to this email.

Best regards,
VJ AI Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Website: www.indianchessacademy.com
📧 Support: indianchessacademy@gmail.com
`.trim(),
                    replyto: 'indianchessacademy@gmail.com'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Demo request confirmation email sent');
                return { success: true };
            } else {
                console.error('Email API error:', result);
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send Payment Link email to parent after demo is marked INTERESTED
     */
    sendPaymentLinkEmail: async ({ parentEmail, parentName, studentName, demoId, meetingLink }) => {
        try {
            const paymentLink = `${window.location.origin}/pricing?demoId=${demoId}`;

            let messageBody = `
Dear ${parentName},

Thank you for your interest in VJ AI Chess Academy!

We are excited that ${studentName} showed great potential during the demo session.`;

            // Include meeting link if available
            if (meetingLink) {
                messageBody += `

📅 **Your Demo Class Link:**
${meetingLink}

You can join the class using the link above at the scheduled time.`;
            }

            messageBody += `

To complete the enrollment and start the chess journey, please click the link below to select a plan and make the payment:

👉 ${paymentLink}

If you have any questions, feel free to reply to this email or contact our support team.

Best regards,
VJ AI Chess Academy Team
            `.trim();

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_API_KEY,
                    subject: `🎓 VJ AI Chess Academy - Complete ${studentName}'s Enrollment`,
                    from_name: 'VJ AI Chess Academy',
                    to: parentEmail,
                    message: messageBody,
                    replyto: 'indianchessacademy@gmail.com' // Replace with actual support email
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('Payment link email sent successfully');
                return { success: true };
            } else {
                console.error('Email API error:', result);
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send Welcome email after payment is approved
     */
    sendWelcomeEmail: async ({ parentEmail, parentName, studentName, planName }) => {
        try {
            const loginLink = `${window.location.origin}/login`;

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_API_KEY,
                    subject: `🎉 Welcome to VJ AI Chess Academy, ${studentName}!`,
                    from_name: 'VJ AI Chess Academy',
                    to: parentEmail,
                    message: `
Dear ${parentName},

Congratulations! 🎉

${studentName} is now officially enrolled in the "${planName}" program at VJ AI Chess Academy.

Your account has been activated. You can log in to view:
- Assigned Coach & Batch
- Class Schedule
- Assignments & Progress

👉 Login Here: ${loginLink}

Your coach will reach out soon to schedule the first class.

Welcome to the VJ AI Chess family! ♔

Best regards,
VJ AI Chess Academy Team
                    `.trim()
                })
            });

            const result = await response.json();
            return result.success ? { success: true } : { success: false, error: result.message };
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return { success: false, error: error.message };
        }
    },
    /**
     * Send Contact Form Submission
     */
    sendContactFormEmail: async ({ name, email, phone, message }) => {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_API_KEY,
                    subject: `New Contact Inquiry from ${name}`,
                    from_name: 'VJ AI Website Contact',
                    to: 'indianchessacademy@gmail.com', // Sent to Admin
                    message: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}

Message:
${message}
                    `.trim(),
                    replyto: email
                })
            });

            const result = await response.json();
            return result.success ? { success: true } : { success: false, error: result.message };
        } catch (error) {
            console.error('Failed to send contact email:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send Coach Approval & Credentials Email
     */
    sendCoachWelcomeEmail: async ({ email, fullName, password }) => {
        try {
            const loginLink = `${window.location.origin}/login`;

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_API_KEY,
                    subject: `Welcome to the Faculty! - VJ AI Chess Academy`,
                    from_name: 'VJ AI Chess Academy',
                    to: email,
                    message: `
Dear ${fullName},

We are delighted to welcome you to the VJ AI Chess Academy teaching faculty! ♟️

Your application has been approved. You can now access the Coach Dashboard to manage your profile and batches.

🔐 **Your Login Credentials:**
Email: ${email}
Password: ${password}

👉 Login Here: ${loginLink}
*Please change your password after your first login.*

We look forward to seeing your expertise in action!

Best regards,
Admin Team
VJ AI Chess Academy
                    `.trim()
                })
            });

            const result = await response.json();
            return result.success ? { success: true } : { success: false, error: result.message };
        } catch (error) {
            console.error('Failed to send coach welcome email:', error);
            return { success: false, error: error.message };
        }
    }
};

export default emailService;
