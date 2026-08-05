/**
 * Text-node escaping (via textContent/innerHTML) doesn't cover the `"`/`'`
 * characters, since quote-encoding is an attribute-serialization rule, not a
 * text-node one. Every caller here also interpolates into `value="..."`
 * attributes, so both context types need to be safe.
 */
export function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML.replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
