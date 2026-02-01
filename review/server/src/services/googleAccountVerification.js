// // server/src/services/gmailVerificationService.js
// const axios = require('axios');

// class GmailVerificationService {
//   constructor() {
//     this.gmailDomains = ['gmail.com', 'googlemail.com'];
//   }

//   // Check if email is a Gmail address
//   isGmail(email) {
//     const domain = email.split('@')[1]?.toLowerCase();
//     return this.gmailDomains.includes(domain);
//   }

//   // Verify Gmail account exists using Google's API (limited approach)
//   async verifyGmailExists(email) {
//     try {
//       // Method 1: Check MX records for Gmail domain
//       if (!this.isGmail(email)) {
//         return { valid: false, message: 'Please use a Gmail address' };
//       }

//       // Method 2: Simple regex validation for Gmail format
//       const gmailRegex = /^[a-zA-Z0-9.]+@gmail\.com$/;
//       if (!gmailRegex.test(email.toLowerCase())) {
//         return { valid: false, message: 'Invalid Gmail address format' };
//       }

//       // Method 3: Check for common disposable patterns in Gmail
//       const localPart = email.split('@')[0].toLowerCase();
//       const disposablePatterns = [
//         'test', 'temp', 'fake', 'demo', 'example', 'admin', 'user'
//       ];
      
//       if (disposablePatterns.some(pattern => localPart.includes(pattern))) {
//         return { valid: false, message: 'Please use your real Gmail address' };
//       }

//       // Method 4: Check for suspicious patterns
//       if (localPart.length < 3 || localPart.length > 30) {
//         return { valid: false, message: 'Invalid Gmail address' };
//       }

//       return { valid: true, message: 'Valid Gmail address' };

//     } catch (error) {
//       console.error('Gmail verification error:', error);
//       return { valid: false, message: 'Error verifying Gmail address' };
//     }
//   }

//   // Enhanced validation for Gmail addresses
//   async validateGmailForRegistration(email) {
//     // Step 1: Basic email format check
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return { valid: false, message: 'Invalid email format' };
//     }

//     // Step 2: Check if it's a Gmail address
//     if (!this.isGmail(email)) {
//       return { 
//         valid: false, 
//         message: 'Please register with a Gmail account (Gmail addresses only)' 
//       };
//     }

//     // Step 3: Enhanced Gmail validation
//     const gmailValidation = await this.verifyGmailExists(email);
//     if (!gmailValidation.valid) {
//       return gmailValidation;
//     }

//     // Step 4: Additional Gmail-specific checks
//     const localPart = email.split('@')[0];
    
//     // Check for consecutive dots (invalid in Gmail)
//     if (localPart.includes('..')) {
//       return { valid: false, message: 'Invalid Gmail address format' };
//     }

//     // Check for invalid characters in Gmail
//     const validLocalPart = /^[a-zA-Z0-9.]+$/;
//     if (!validLocalPart.test(localPart)) {
//       return { valid: false, message: 'Gmail address contains invalid characters' };
//     }

//     return { valid: true, message: 'Valid Gmail address ready for verification' };
//   }
// }

// module.exports = new GmailVerificationService();

// server/src/services/googleAccountVerification.js
// const axios = require('axios');

// class GoogleAccountVerification {
//   constructor() {
//     this.gmailDomains = ['gmail.com', 'googlemail.com'];
//   }

//   // Check if email is a Gmail address
//   isGmail(email) {
//     const domain = email.split('@')[1]?.toLowerCase();
//     return this.gmailDomains.includes(domain);
//   }

//   // Method 1: Check Google Account existence using Sign-in flow simulation
//   async checkGoogleAccountExists(email) {
//     try {
//       if (!this.isGmail(email)) {
//         return { exists: false, message: 'Please use a Gmail address' };
//       }

//       // Use Google's federated login discovery endpoint
//       const response = await axios.get(
//         `https://accounts.google.com/.well-known/openid-configuration`,
//         { timeout: 10000 }
//       );

//       // We can't directly check account existence due to privacy, 
//       // but we can validate the email format and use other methods
//       return await this.validateGmailAccount(email);
      
//     } catch (error) {
//       console.error('Google account check error:', error);
//       return { exists: false, message: 'Unable to verify Google account' };
//     }
//   }

//   // Method 2: Enhanced Gmail validation
//   async validateGmailAccount(email) {
//     const localPart = email.split('@')[0].toLowerCase();
    
//     // Block obviously fake emails
//     const fakePatterns = [
//       'test', 'temp', 'fake', 'demo', 'example', 'admin', 'user', 
//       'dummy', 'sample', 'invalid', 'notreal', 'noreply'
//     ];

//     if (fakePatterns.some(pattern => localPart.includes(pattern))) {
//       return { exists: false, message: 'This does not appear to be a real Gmail account' };
//     }

//     // Check for valid Gmail local part rules
//     if (localPart.length < 3) {
//       return { exists: false, message: 'Gmail address is too short' };
//     }

//     if (localPart.length > 30) {
//       return { exists: false, message: 'Gmail address is too long' };
//     }

//     // Gmail doesn't allow consecutive dots
//     if (localPart.includes('..')) {
//       return { exists: false, message: 'Invalid Gmail address format' };
//     }

//     // Gmail local part can only contain letters, numbers, and dots
//     if (!/^[a-zA-Z0-9.]+$/.test(localPart)) {
//       return { exists: false, message: 'Gmail address contains invalid characters' };
//     }

//     // Gmail doesn't start or end with dot
//     if (localPart.startsWith('.') || localPart.endsWith('.')) {
//       return { exists: false, message: 'Gmail address cannot start or end with a dot' };
//     }

//     // Additional real-world validation
//     const commonInvalidPatterns = [
//       /^[0-9]+$/, // Only numbers
//       /^[a-z]+\.[0-9]+$/, // name.123 pattern (often fake)
//       /^[a-z]+[0-9]{4,}$/, // name12345 pattern (often fake)
//     ];

//     if (commonInvalidPatterns.some(pattern => pattern.test(localPart))) {
//       return { exists: false, message: 'This does not appear to be a real personal Gmail account' };
//     }

//     // If all checks pass, we assume it's potentially valid
//     // Real verification happens via email confirmation
//     return { exists: true, message: 'Valid Gmail address format' };
//   }

//   // Method 3: DNS-based validation for custom domains (optional)
//   async checkEmailDomain(email) {
//     try {
//       const domain = email.split('@')[1];
      
//       // For Gmail, we know the domain exists
//       if (this.isGmail(email)) {
//         return { valid: true, message: 'Valid Gmail domain' };
//       }

//       // For custom domains, we could check MX records here
//       // This is more complex and requires additional setup
      
//       return { valid: true, message: 'Valid domain' };
//     } catch (error) {
//       return { valid: false, message: 'Invalid email domain' };
//     }
//   }

//   // Main verification method
//   async verifyRealGoogleAccount(email) {
//     // Step 1: Basic email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return { valid: false, exists: false, message: 'Invalid email format' };
//     }

//     // Step 2: Must be Gmail
//     if (!this.isGmail(email)) {
//       return { 
//         valid: false, 
//         exists: false, 
//         message: 'Please register with a Gmail account (@gmail.com only)' 
//       };
//     }

//     // Step 3: Enhanced Gmail validation
//     const gmailValidation = await this.validateGmailAccount(email);
//     if (!gmailValidation.exists) {
//       return { 
//         valid: false, 
//         exists: false, 
//         message: gmailValidation.message 
//       };
//     }

//     // Step 4: Final verification via email confirmation
//     return { 
//       valid: true, 
//       exists: true, 
//       message: 'Valid Gmail account. Please check your email for verification.' 
//     };
//   }
// }

// module.exports = new GoogleAccountVerification();