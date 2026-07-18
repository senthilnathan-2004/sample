/**
 * Conservative HTML sanitizer for CMS rich-text (policy pages). Strips scripts,
 * styles, event handlers, and dangerous URschemes. This is a pragmatic allowlist
 * approach — for a hardened setup, swap in a vetted library (e.g. sanitize-html /
 * DOMPurify) at the API boundary. Documented as a known simplification.
 */
const ALLOWED_TAGS = [
  "p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "a", "h1", "h2", "h3", "h4",
  "blockquote", "hr", "span", "div",
];

export function sanitizeHtml(input: string): string {
  let html = input;

  // Remove script/style/iframe/object blocks entirely.
  html = html.replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  // Remove any on* event handler attributes.
  html = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Neutralise javascript: / data: URLs in href/src.
  html = html.replace(/(href|src)\s*=\s*("|')?\s*(javascript|data):[^"'>\s]*/gi, '$1="#"');
  // Strip disallowed tags (keep their inner text).
  html = html.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (match, tag) =>
    ALLOWED_TAGS.includes(String(tag).toLowerCase()) ? match : "",
  );

  return html.trim();
}
