import * as vscode from 'vscode';

function prop(
  label: string,
  snippet: string,
  doc: string,
): vscode.CompletionItem {
  const it = new vscode.CompletionItem(label, vscode.CompletionItemKind.Property);
  it.insertText = new vscode.SnippetString(snippet);
  it.documentation = new vscode.MarkdownString(doc);
  it.detail = 'Bear';
  return it;
}

const FLEX_PROPS: vscode.CompletionItem[] = [
  prop('direction', 'direction="${1|row,column|}"', '`Flex` — `row` | `column`'),
  prop('gap', 'gap={${1|0,1,2,3,4,5,6,8,10,12|}}', '`Flex` — spacing scale 0–12'),
  prop('align', 'align="${1|start,center,end,stretch,baseline|}"', '`Flex` — cross-axis alignment'),
  prop('justify', 'justify="${1|start,center,end,between,around,evenly|}"', '`Flex` — main-axis alignment'),
  prop('wrap', 'wrap="${1|wrap,nowrap,wrap-reverse|}"', '`Flex` — flex-wrap'),
  prop('grow', 'grow={${1|true,false|}}', '`Flex` — flex grow'),
  prop('className', 'className="$1"', 'Utility classes (AeroCraft)'),
  prop('style', 'style={{ $1 }}', 'Inline style object'),
];

const BUTTON_PROPS: vscode.CompletionItem[] = [
  prop('variant', 'variant="${1|primary,secondary,outline,ghost,danger|}"', '`Button` — visual style'),
  prop('size', 'size="${1|xs,sm,md,lg|}"', '`Button` — size'),
  prop('leftIcon', 'leftIcon={$1}', '`Button` — icon node'),
  prop('rightIcon', 'rightIcon={$1}', '`Button` — icon node'),
  prop('loading', 'loading={$1}', '`Button` — loading state'),
  prop('disabled', 'disabled={$1}', '`Button` — disabled'),
  prop('fullWidth', 'fullWidth', '`Button` — full width'),
  prop('onClick', 'onClick={$1}', '`Button` — click handler'),
  prop('className', 'className="$1"', 'Utility classes'),
];

const CARD_PROPS: vscode.CompletionItem[] = [
  prop('padding', 'padding="${1|none,sm,md,lg|}"', '`Card` — padding'),
  prop('radius', 'radius="${1|none,sm,md,lg,full|}"', '`Card` — border radius'),
  prop('variant', 'variant="${1|default,elevated,outlined|}"', '`Card` — variant (if supported)'),
  prop('hoverable', 'hoverable', '`Card` — hover elevation'),
  prop('className', 'className="$1"', 'Utility classes'),
];

const TYPO_PROPS: vscode.CompletionItem[] = [
  prop('variant', 'variant="${1|h1,h2,h3,h4,h5,h6,body1,body2,caption,overline|}"', '`Typography` — text style'),
  prop('weight', 'weight="${1|normal,medium,semibold,bold|}"', '`Typography` — font weight'),
  prop('color', 'color="${1|primary,secondary,muted,danger,success|}"', '`Typography` — semantic color token'),
  prop('className', 'className="$1"', 'Utility classes'),
];

const INPUT_PROPS: vscode.CompletionItem[] = [
  prop('label', 'label="$1"', '`Input` — label'),
  prop('error', 'error="$1"', '`Input` — error message'),
  prop('helperText', 'helperText="$1"', '`Input` — helper'),
  prop('disabled', 'disabled={$1}', '`Input` — disabled'),
  prop('fullWidth', 'fullWidth', '`Input` — full width'),
  prop('className', 'className="$1"', 'Utility classes'),
];

export const BEAR_TAG_PROPS: Record<string, vscode.CompletionItem[]> = {
  Flex: FLEX_PROPS,
  Button: BUTTON_PROPS,
  Card: CARD_PROPS,
  Typography: TYPO_PROPS,
  Input: INPUT_PROPS,
};

export function getBearPropsForTag(tag: string): vscode.CompletionItem[] | undefined {
  return BEAR_TAG_PROPS[tag];
}

export function jsxOpeningTagBeforeCursor(textBefore: string): string | null {
  const lastLt = textBefore.lastIndexOf('<');
  if (lastLt === -1) return null;
  const from = textBefore.slice(lastLt);
  if (/^<\//.test(from)) return null;
  const m = from.match(/^<([A-Z][a-zA-Z0-9]*)\b/);
  if (!m) return null;
  const tag = m[1];
  const afterName = from.slice(m[0].length);
  if (/^\s*\//.test(afterName)) return null;
  const gt = afterName.indexOf('>');
  if (gt !== -1) {
    const beforeClose = afterName.slice(0, gt);
    const quoteCount = (beforeClose.match(/["'`]/g) || []).length;
    if (quoteCount % 2 === 0) return null;
  }
  return tag;
}
