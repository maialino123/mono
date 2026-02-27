const BANNED_KEYWORDS = [
  'shopee', 'lazada', 'tiki', 'sendo',
  'mua ngay', 'giảm giá', 'sale', 'khuyến mãi',
  'click here', 'buy now', 'order now',
  'affiliate', 'commission'
];

export function sanitizeContent(text: string): string {
  let clean = text;
  BANNED_KEYWORDS.forEach(kw => {
    clean = clean.replace(new RegExp(kw, 'gi'), '');
  });
  return clean;
}

export function containsBannedKeyword(text: string): string | null {
  const lower = text.toLowerCase();
  for (const kw of BANNED_KEYWORDS) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

export function validateProductContent(products: Array<{ description: string; title: string }>) {
  const errors: string[] = [];
  products.forEach((p, i) => {
    const titleBanned = containsBannedKeyword(p.title);
    const descBanned = containsBannedKeyword(p.description);
    if (titleBanned) errors.push(`Product ${i}: banned keyword "${titleBanned}" in title`);
    if (descBanned) errors.push(`Product ${i}: banned keyword "${descBanned}" in description`);
  });
  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n${errors.join('\n')}`);
  }
}
