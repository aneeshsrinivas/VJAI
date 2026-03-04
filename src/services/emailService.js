const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001';

const sendEmail = async ({ to, subject, text, html }) => {
    const response = await fetch(`${EMAIL_API_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text, html })
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Email send failed: ${err}`);
    }
    return { success: true };
};

export const emailService = {
    sendDemoRequestConfirmation: async ({ parentEmail, parentName, studentName, preferredDate, preferredTime, demoId }) => {
        try {
            await sendEmail({
                to: parentEmail,
                subject: `✅ Demo Request Confirmed - ${studentName} | Indian Chess Academy`,
                text: `Dear ${parentName},

Thank you for booking a free demo session with Indian Chess Academy! 🎉

We're excited to help ${studentName} start their chess journey.

📋 Your Demo Request Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Student Name: ${studentName}
• Preferred Date: ${preferredDate}
• Preferred Time: ${preferredTime}
• Demo ID: ${demoId}

⏭️ What Happens Next:
1. Our admin team will review your request shortly
2. We'll match ${studentName} with the best coach based on their skill level
3. You'll receive a confirmation email with the assigned coach details, meeting link, and exact demo time

📧 Have Questions?
Feel free to contact us at indianchessacademy@email.com

Best regards,
Indian Chess Academy Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Website: www.indianchessacademy.com
📧 Support: indianchessacademy@email.com`
            });
            console.log('✅ Demo request confirmation email sent to:', parentEmail);
            return { success: true };
        } catch (error) {
            console.error('Failed to send demo confirmation email:', error);
            return { success: false, error: error.message };
        }
    },

    sendPaymentLinkEmail: async ({ parentEmail, parentName, studentName, demoId }) => {
        try {
            const paymentLink = `https://vjai.onrender.com/pricing?demoId=${demoId}`;
            const text = `Dear ${parentName},

Thank you for your interest in Indian Chess Academy!

We are excited that ${studentName} showed great potential during the demo session.

To complete the enrollment, please click the link below to select a plan and make the payment:

👉 ${paymentLink}

Best regards,
Indian Chess Academy Team`;

            await sendEmail({
                to: parentEmail,
                subject: `🎓 Indian Chess Academy - Complete ${studentName}'s Enrollment`,
                text
            });
            console.log('✅ Payment link email sent to:', parentEmail);
            return { success: true };
        } catch (error) {
            console.error('Failed to send payment link email:', error);
            return { success: false, error: error.message };
        }
    },

    sendWelcomeEmail: async ({ parentEmail, parentName, studentName, planName }) => {
        try {
            const loginLink = `https://vjai.onrender.com/login`;
            await sendEmail({
                to: parentEmail,
                subject: `🎉 Welcome to Indian Chess Academy, ${studentName}!`,
                text: `Dear ${parentName},

Congratulations! 🎉

${studentName} is now officially enrolled in the "${planName}" program at Indian Chess Academy.

Your account has been activated. You can log in to view:
- Assigned Coach & Batch
- Class Schedule
- Assignments & Progress

👉 Login Here: ${loginLink}

Your coach will reach out soon to schedule the first class.

Welcome to the Indian Chess Academy family! ♔

Best regards,
Indian Chess Academy Team`
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return { success: false, error: error.message };
        }
    },

    sendContactFormEmail: async ({ name, email, phone, message }) => {
        try {
            await sendEmail({
                to: 'indianchessacademy@email.com',
                subject: `New Contact Inquiry from ${name}`,
                text: `Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}

Message:
${message}`
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to send contact email:', error);
            return { success: false, error: error.message };
        }
    },

    sendCoachWelcomeEmail: async ({ email, fullName, password }) => {
        try {
            const loginLink = `https://vjai.onrender.com/login`;
            await sendEmail({
                to: email,
                subject: `Welcome to the Faculty! - Indian Chess Academy`,
                text: `Dear ${fullName},

We are delighted to welcome you to the Indian Chess Academy teaching faculty! ♟️

Your application has been approved. You can now access the Coach Dashboard to manage your profile and batches.

🔐 Your Login Credentials:
• Email: ${email}
• Password: ${password}

👉 Login Here: ${loginLink}

Please change your password after your first login.

Best regards,
Admin Team
Indian Chess Academy`
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to send coach welcome email:', error);
            return { success: false, error: error.message };
        }
    }
};

export default emailService;
