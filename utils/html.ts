// HTML utilities for converting to plain text
export function htmlToPlainText(html?: string): string {
    if (!html) return '';
    try {
        const decodeHtmlEntities = (text: string) => {
            const named: Record<string, string> = {
                amp: '&',
                lt: '<',
                gt: '>',
                quot: '"',
                apos: "'",
                nbsp: ' ',
                hellip: '…',
                mldr: '…',
                ndash: '–',
                mdash: '—',
                rsquo: '’',
                lsquo: '‘',
                ldquo: '“',
                rdquo: '”',
                copy: '©',
                reg: '®',
                trade: '™',
                euro: '€',
                pound: '£',
                yen: '¥',
            };

            const decodeOnce = (input: string) => {
                let out = input;
                // Hex numeric entities
                out = out.replace(/&#x([0-9a-fA-F]+);?/g, (m, hex) => {
                    try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return m; }
                });
                // Decimal numeric entities
                out = out.replace(/&#(\d+);?/g, (m, dec) => {
                    try { return String.fromCodePoint(parseInt(dec, 10)); } catch { return m; }
                });
                // Named entities (semicolon optional to catch cases like &hellip)
                out = out.replace(/&([a-zA-Z][a-zA-Z0-9]+);?/g, (m, name) => {
                    const k = String(name).toLowerCase();
                    return Object.prototype.hasOwnProperty.call(named, k) ? named[k] : m;
                });
                return out;
            };

            // Handle double-encoded inputs like &hellip;
            let prev = text;
            let out = decodeOnce(text);
            for (let i = 0; i < 2 && out !== prev; i += 1) {
                prev = out;
                out = decodeOnce(out);
            }
            // Fallback for any stray non-standard spacing entities
            out = out.replace(/&nbsp;/gi, ' ');
            return out;
        };

        const withLineBreaks = html
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/(p|li|div|h[1-6]|tr)>/gi, ' ')
            .replace(/<(p|li|div|h[1-6]|tr)[^>]*>/gi, ' ');
        const withoutTags = withLineBreaks.replace(/<[^>]+>/g, ' ');
        const decoded = decodeHtmlEntities(withoutTags);
        return decoded.replace(/\s+/g, ' ').trim();
    } catch {
        return (html || '').replace(/\s+/g, ' ').trim();
    }
}