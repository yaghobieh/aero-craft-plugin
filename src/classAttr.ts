export function getClassAttrValueMatch(prefix: string): RegExpMatchArray | null {
  return (
    prefix.match(/className\s*=\s*(?:\{\s*)?["']([^"']*)$/) ??
    prefix.match(/\bclass\s*=\s*["']([^"']*)$/)
  );
}

export function insideClassAttrPrefix(prefix: string, lang: string): boolean {
  if (lang === 'html') {
    return (
      /\bclass(?:Name)?\s*=\s*["'][^"']*$/.test(prefix) || /\bclass\s*=\s*["'][^"']*$/.test(prefix)
    );
  }
  if (lang === 'typescriptreact' || lang === 'typescript') {
    return getClassAttrValueMatch(prefix) !== null || /className:\s*["'][^"']*$/.test(prefix);
  }
  if (lang === 'css') {
    return /@apply\s+[^;]*$/.test(prefix);
  }
  return false;
}

export function getCssApplyTailMatch(prefix: string): RegExpMatchArray | null {
  return prefix.match(/@apply\s+([^;]*)$/);
}

export function currentClassNameToken(prefix: string, lang: string): string {
  if (lang === 'css') {
    const m = getCssApplyTailMatch(prefix);
    if (!m) return '';
    const body = m[1].trimEnd();
    const sp = body.lastIndexOf(' ');
    return sp === -1 ? body : body.slice(sp + 1);
  }
  const m = getClassAttrValueMatch(prefix);
  if (!m) return '';
  const body = m[1].trimEnd();
  const sp = body.lastIndexOf(' ');
  return sp === -1 ? body : body.slice(sp + 1);
}

export function filterAeroNames(names: string[], token: string, max: number): string[] {
  const t = token.toLowerCase();
  if (t.length === 0) {
    return names.slice(0, max);
  }
  const starts = names.filter((n) => n.toLowerCase().startsWith(t));
  if (starts.length >= 8) return starts.slice(0, max);
  const contains = names.filter((n) => n.toLowerCase().includes(t));
  const merged = [...new Set([...starts, ...contains])];
  return merged.slice(0, max);
}
