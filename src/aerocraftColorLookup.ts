import { resolveConfig } from '@forgedevstack/aerocraft';

let lookup: Map<string, string> | null = null;

function buildLookup(): Map<string, string> {
  const m = new Map<string, string>();
  const r = resolveConfig({});
  for (const [k, v] of Object.entries(r.customShortcuts)) {
    const css = v.css;
    const val = css.color ?? css['background-color'] ?? css['border-color'];
    if (typeof val === 'string' && !/^var\(/i.test(val)) m.set(k, val);
  }
  return m;
}

export function getColorForUtilityClass(name: string): string | undefined {
  const bracket = name.match(/^(?:color|background|border-color)-\[([^\]]+)\]$/);
  if (bracket) return bracket[1].replace(/_/g, ' ').trim();
  if (!lookup) lookup = buildLookup();
  return lookup.get(name.replace(/^!|!$/g, ''));
}
