// // server/src/services/emailService.js
// const nodemailer = require('nodemailer');

// class EmailService {
//   constructor() {
//     this.transporter = nodemailer.createTransporter({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
//   }

//   async sendVerificationEmail(user, verificationToken) {
//     const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: 'Verify Your Email - Company Reviews',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">Welcome to Company Reviews!</h2>
//           <p>Hi ${user.name},</p>
//           <p>Thank you for registering. Please verify your email address to activate your account.</p>
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${verificationUrl}" 
//                style="background-color: #2563eb; color: white; padding: 12px 24px; 
//                       text-decoration: none; border-radius: 6px; display: inline-block;">
//               Verify Email Address
//             </a>
//           </div>
//           <p>Or copy and paste this link in your browser:</p>
//           <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
//           <p>This link will expire in 24 hours.</p>
//           <hr style="margin: 30px 0;">
//           <p style="color: #6b7280; font-size: 14px;">
//             If you didn't create an account, please ignore this email.
//           </p>
//         </div>
//       `,
//     };

//     try {
//       await this.transporter.sendMail(mailOptions);
//       console.log(`Verification email sent to: ${user.email}`);
//       return true;
//     } catch (error) {
//       console.error('Error sending verification email:', error);
//       return false;
//     }
//   }
// }

// module.exports = new EmailService();