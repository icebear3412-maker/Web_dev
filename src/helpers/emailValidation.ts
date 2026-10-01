/** Basic form validation; delivery and ownership must be verified by the backend. */
export function emailValidation(value: string): boolean {
  const email = value.trim();
  if (email.length > 254) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (
    !local ||
    local.length > 64 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..')
  )
    return false;
  return (
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) &&
    /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(domain)
  );
}
