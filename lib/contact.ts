export const PUBLIC_CONTACT_EMAIL = "nabeel.rizwaan@gmail.com"

export type ContactDraft = { name: string; email: string; message: string }

/** Open a draft only; the visitor still reviews and sends it in their email app. */
export function createContactDraft({ name, email, message }: ContactDraft): string {
  const subject = encodeURIComponent(`Portfolio contact from ${name}`)
  const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`)
  return `mailto:${PUBLIC_CONTACT_EMAIL}?subject=${subject}&body=${body}`
}
