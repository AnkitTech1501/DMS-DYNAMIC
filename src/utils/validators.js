const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value).trim());
}

export function validateEmailField(value) {
  if (!value || !value.trim()) return 'Email is required.';
  if (!isValidEmail(value)) return 'Please enter a valid email address.';
  return null;
}