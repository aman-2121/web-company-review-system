class EmailValidator {
  // ✅ ALLOWED EMAIL PROVIDERS (Real providers)
  static allowedProviders = new Set([
    'gmail.com', 'googlemail.com', 'google.com',
    'yahoo.com', 'ymail.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.de', 'yahoo.fr', 'yahoo.es',
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
    'aol.com', 'aim.com',
    'icloud.com', 'me.com', 'mac.com',
    'protonmail.com', 'protonmail.ch', 'pm.me',
    'zoho.com', 'zohomail.com',
    'yandex.com', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz',
    'mail.com', 'email.com', 'usa.com', 'myself.com', 'post.com',
    'gmx.com', 'gmx.net', 'gmx.de', 'gmx.fr', 'gmx.es',
    'fastmail.com', 'fastmail.fm',
    'tutanota.com', 'tuta.io',
    'hey.com',
    'icloud.com',
    'me.com',
    'mac.com'
  ]);

  // ✅ ALLOWED EDUCATIONAL/GOVERNMENT DOMAINS
  static allowedInstitutions = new Set([
    'edu', 'ac.uk', 'edu.au', 'edu.ca', 'edu.cn', 'edu.in', 'edu.br', 'edu.mx'
  ]);

  // 🚫 DISPOSABLE DOMAINS (Only actual temporary email services)
  static disposableDomains = new Set([
    // Temporary email services
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'mailinator.org',
    'yopmail.com', 'yopmail.fr', 'yopmail.net',
    'throwawaymail.com', 'fakeinbox.com', 'temp-mail.org', 'temp-mail.ru',
    'trashmail.com', 'getairmail.com', 'mohmal.com', 'dispostable.com',
    '33mail.com', 'anonbox.net', 'boximail.com', 'discard.email',
    'disposable-email.ml', 'dodsi.com', 'jetable.org', 'mailcatch.com',
    'mailmetrash.com', 'mailmoat.com', 'mintemail.com', 'mytrashmail.com',
    'nwytg.com', 'objectmail.com', 'proxymail.eu', 'rcpt.at', 'spam4.me',
    'spamgourmet.com', 'spamhole.com', 'tempail.com', 'tempinbox.com',
    'temporary-mail.net', 'thankyou2010.com', 'trashmail.at', 'trashmail.net',
    'trashmail.ws', 'wegwerfmail.de', 'wegwerfmail.net', 'wh4f.org', 'zippymail.info',
    
    // Test domains
    'example.com', 'example.org', 'example.net', 'test.com', 'test.org', 'test.net',
    'localhost.com', 'domain.com'
  ]);

  // ✅ VALID TLDs
  static validTLDs = new Set([
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'io', 'co', 'info', 'biz', 'me',
    'uk', 'ca', 'au', 'de', 'fr', 'it', 'es', 'nl', 'se', 'no', 'dk', 'fi',
    'ie', 'pt', 'be', 'ch', 'at', 'jp', 'cn', 'in', 'br', 'ru', 'za', 'mx',
    'ar', 'cl', 'pe', 'nz', 'sg', 'hk', 'my', 'th', 'id', 'vn', 'ph', 'kr',
    'tw', 'il', 'ae', 'sa', 'qa', 'kw', 'bh', 'om', 'jo', 'lb', 'eg', 'ma',
    'dz', 'tn', 'ly', 'pl', 'cz', 'hu', 'ro', 'bg', 'gr', 'tr', 'ua', 'kz'
  ]);

  // 🚫 FAKE PATTERNS
  static fakePatterns = new Set([
    'test', 'fake', 'demo', 'admin', 'user', 'temp', 'dummy', 'example', 
    'sample', 'invalid', 'notreal'
  ]);

  static async isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, message: 'Email is required' };
    }

    // Trim and lowercase
    email = email.trim().toLowerCase();

    // Basic format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    const [localPart, domain] = email.split('@');
    
    if (!domain) {
      return { valid: false, message: 'Invalid email domain' };
    }

    // ✅ FIRST: Check if it's a known real provider
    if (this.allowedProviders.has(domain)) {
      return { valid: true, message: 'Valid email address' };
    }

    // ✅ Check if it's an educational/government domain
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    const secondLevelDomain = domainParts.length > 1 ? domainParts[domainParts.length - 2] + '.' + tld : '';
    
    if (this.allowedInstitutions.has(tld) || this.allowedInstitutions.has(secondLevelDomain)) {
      return { valid: true, message: 'Valid email address' };
    }

    // 🚫 Check against disposable domains
    for (const disposable of this.disposableDomains) {
      if (domain === disposable || domain.endsWith('.' + disposable)) {
        return { valid: false, message: 'Disposable email addresses are not allowed. Please use a real email provider.' };
      }
    }

    // ✅ Check TLD - if it's a valid TLD and not in disposable list, allow it
    if (tld && this.validTLDs.has(tld.toLowerCase())) {
      // For custom domains, we'll allow them by default since they're likely real businesses
      return { valid: true, message: 'Valid email address' };
    }

    // 🚫 Check for fake patterns in local part
    if (this.fakePatterns.has(localPart.toLowerCase())) {
      return { valid: false, message: 'Please use a real email address, not a test or generic address' };
    }

    // ✅ Default: Allow the email if it passes basic validation
    return { valid: true, message: 'Valid email address' };
  }

  static validateEmailForRegistration(email) {
    return this.isValidEmail(email);
  }
}

module.exports = EmailValidator;