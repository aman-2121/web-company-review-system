const dns = require('dns').promises;

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
  ]);

  // ✅ ALLOWED EDUCATIONAL/GOVERNMENT DOMAINS
  static allowedInstitutions = new Set([
    'edu', 'ac.uk', 'edu.au', 'edu.ca', 'edu.cn', 'edu.in', 'edu.br', 'edu.mx', 'gov', 'mil'
  ]);

  // 🚫 DISPOSABLE DOMAINS
  static disposableDomains = new Set([
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
    'example.com', 'example.org', 'example.net', 'test.com', 'test.org', 'test.net',
    'localhost.com', 'domain.com', 'invalid.com', 'nowhere.com'
  ]);

  // 🚫 FAKE PATTERNS IN LOCAL PART
  static fakePatterns = new Set([
    'test', 'fake', 'demo', 'admin', 'user', 'temp', 'dummy', 'example',
    'sample', 'invalid', 'notreal', 'qwerty', 'asdf', '123456'
  ]);

  static async checkMxRecord(domain) {
    try {
      const records = await dns.resolveMx(domain);
      return records && records.length > 0;
    } catch (error) {
      console.error(`MX Check failed for domain ${domain}:`, error.message);
      return false;
    }
  }

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

    // 🚫 Check against disposable domains
    for (const disposable of this.disposableDomains) {
      if (domain === disposable || domain.endsWith('.' + disposable)) {
        return { valid: false, message: 'Disposable or test email addresses are not allowed.' };
      }
    }

    // 🚫 Check for fake patterns in local part (if domain isn't a known good provider)
    if (!this.allowedProviders.has(domain) && this.fakePatterns.has(localPart)) {
      return { valid: false, message: 'Please use a real email address.' };
    }

    // ✅ MX Record Check (The "Real Usable" Check)
    // We skip MX check for known reliable providers to save time/resources, assuming they are always up
    if (this.allowedProviders.has(domain)) {
      return { valid: true, message: 'Valid email address' };
    }

    // Check allowInstitutions
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    const secondLevelDomain = domainParts.length > 1 ? domainParts[domainParts.length - 2] + '.' + tld : '';

    if (this.allowedInstitutions.has(tld) || this.allowedInstitutions.has(secondLevelDomain)) {
      // Still try MX check for generic edu/gov domains just in case, or trust them? 
      // Let's trust generic checks for now but ideally MX check everyone except major providers.
      // Actually, let's just do MX check for everyone except the static AllowList to be safe.
      // But wait, dns lookup might be blocked in some environments? Node usually can do it.
    }

    // For everything else (custom domains, less common providers), we check MX records
    const hasMx = await this.checkMxRecord(domain);
    if (!hasMx) {
      return { valid: false, message: 'Invalid email domain. Cannot receive emails.' };
    }

    return { valid: true, message: 'Valid email address' };
  }

  static async validateEmailForRegistration(email) {
    return this.isValidEmail(email);
  }
}

module.exports = EmailValidator;