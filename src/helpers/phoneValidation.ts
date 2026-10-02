/** Accept domestic and +84 Vietnamese numbers, with optional spaces, dots or hyphens. */
export function phoneValidation(value: string): boolean {
  const phone = value.trim().replace(/[\s.-]/g, '');
  return /^(?:0|\+84)(?:[35789]\d{8}|2\d{9})$/.test(phone);
}
