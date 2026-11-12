/** Field rules shared by the form (client) and the API schema (server) — no dependencies, keeps zod off the client. */
export const nameOk = (v: string) => {
  const n = v.trim().length;
  return n >= 2 && n <= 80;
};
/** +992 and international numbers: 7–15 digits, common separators. */
export const phoneOk = (v: string) => {
  const s = v.trim();
  const n = s.replace(/\D/g, '').length;
  return s.length <= 32 && /^\+?[\d\s()-]+$/.test(s) && n >= 7 && n <= 15;
};

/** Mockup error states of the form: name / tel. */
export function leadFieldErrors(name: string, phone: string) {
  const e: ('name' | 'tel')[] = [];
  if (!nameOk(name)) e.push('name');
  if (!phoneOk(phone)) e.push('tel');
  return e;
}
