import * as vscode from 'vscode';
import { listResolvedUtilityNames, resolveConfig } from '@forgedevstack/aerocraft';
import { UTILITY_ALIAS_SUGGESTIONS } from './aerocraftSuggestions.const';
import { getColorForUtilityClass } from './aerocraftColorLookup';
import { BEAR_COMPONENT_HINTS } from './bearComponents.const';
import { getBearPropsForTag, jsxOpeningTagBeforeCursor } from './bearProps';
import {
  currentClassNameToken,
  filterAeroNames,
  insideClassAttrPrefix,
} from './classAttr';

const AERO_COMPLETION_CAP = 180;
const AERO_COMPLETION_CAP_EMPTY = 80;

let cachedAeroNames: string[] | null = null;

function allAeroClassNames(): string[] {
  if (!cachedAeroNames) {
    cachedAeroNames = listResolvedUtilityNames(resolveConfig({}));
  }
  return cachedAeroNames;
}

function linePrefix(document: vscode.TextDocument, position: vscode.Position): string {
  const start = new vscode.Position(position.line, 0);
  return document.getText(new vscode.Range(start, position));
}

function fullPrefix(document: vscode.TextDocument, position: vscode.Position): string {
  return document.getText(new vscode.Range(new vscode.Position(0, 0), position));
}

function stripImportant(name: string): string {
  if (name.startsWith('!')) return name.slice(1);
  if (name.endsWith('!')) return name.slice(0, -1);
  return name;
}

const docSelector: vscode.DocumentSelector = [
  { language: 'html' },
  { language: 'javascriptreact' },
  { language: 'javascript' },
  { language: 'typescriptreact' },
  { language: 'typescript' },
  { language: 'css' },
];

function aeroDocumentation(label: string): vscode.MarkdownString | undefined {
  const raw = stripImportant(label);
  const color = getColorForUtilityClass(raw);
  const md = new vscode.MarkdownString();
  md.isTrusted = true;
  if (color) {
    md.supportHtml = true;
    md.appendMarkdown(
      `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid #888;background:${color};vertical-align:middle;margin-right:6px"></span>`,
    );
    md.appendMarkdown(` \`${color}\` — `);
  }
  md.appendMarkdown(`AeroCraft utility \`${label}\``);
  return md;
}

export function activate(context: vscode.ExtensionContext): void {
  const aeroProvider = vscode.languages.registerCompletionItemProvider(
    docSelector,
    {
      provideCompletionItems(document, position) {
        const ac = vscode.workspace.getConfiguration('aerocraft');
        if (!ac.get<boolean>('enableCompletions')) {
          return undefined;
        }
        const prefix = linePrefix(document, position);
        const lang = document.languageId;
        if (!insideClassAttrPrefix(prefix, lang)) {
          return undefined;
        }
        const token = currentClassNameToken(prefix, lang);
        const cap = token.length === 0 ? AERO_COMPLETION_CAP_EMPTY : AERO_COMPLETION_CAP;
        const names = filterAeroNames(allAeroClassNames(), token, cap);
        const alias = ac.get<boolean>('utilityAliasMode');
        const range = new vscode.Range(
          position.line,
          token.length > 0 ? position.character - token.length : position.character,
          position.line,
          position.character,
        );
        const items: vscode.CompletionItem[] = [];
        for (const s of names) {
          const it = new vscode.CompletionItem(s, vscode.CompletionItemKind.Constant);
          it.detail = 'AeroCraft';
          it.sortText = `0-${s}`;
          it.range = range;
          const doc = aeroDocumentation(s);
          if (doc) it.documentation = doc;
          items.push(it);
        }
        if (alias) {
          for (const s of UTILITY_ALIAS_SUGGESTIONS) {
            const it = new vscode.CompletionItem(s, vscode.CompletionItemKind.Enum);
            it.detail = 'Alias (multi-class)';
            it.sortText = `1-${s}`;
            it.range = range;
            items.push(it);
          }
        }
        return items;
      },
    },
    '"',
    "'",
    '`',
    ' ',
    '.',
    '-',
    ':',
  );

  const bearPropsProvider = vscode.languages.registerCompletionItemProvider(
    [{ language: 'typescriptreact' }, { language: 'typescript' }],
    {
      provideCompletionItems(document, position) {
        const ac = vscode.workspace.getConfiguration('aerocraft');
        if (!ac.get<boolean>('enableCompletions')) {
          return undefined;
        }
        const prefix = linePrefix(document, position);
        if (insideClassAttrPrefix(prefix, document.languageId)) {
          return undefined;
        }
        const before = fullPrefix(document, position);
        const tag = jsxOpeningTagBeforeCursor(before);
        if (!tag) return undefined;
        const props = getBearPropsForTag(tag);
        if (!props || props.length === 0) return undefined;
        return props;
      },
    },
    ' ',
    '\n',
  );

  const hover = vscode.languages.registerHoverProvider(docSelector, {
    provideHover(document, position) {
      if (document.languageId === 'typescriptreact' || document.languageId === 'typescript') {
        const tagRange = document.getWordRangeAtPosition(position, /[A-Z][a-zA-Z0-9_]*/);
        if (tagRange) {
          const tag = document.getText(tagRange);
          const hint = BEAR_COMPONENT_HINTS[tag];
          if (hint) {
            const md = new vscode.MarkdownString(hint);
            md.isTrusted = true;
            return new vscode.Hover(md, tagRange);
          }
        }
      }
      const prefix = linePrefix(document, position);
      const lang = document.languageId;
      if (!insideClassAttrPrefix(prefix, lang)) {
        return undefined;
      }
      const range =
        document.getWordRangeAtPosition(position, /!?[\w:[\]#%,./-]+!?/) ??
        document.getWordRangeAtPosition(position);
      if (!range) return undefined;
      const raw = document.getText(range);
      const token = stripImportant(raw);
      const md = new vscode.MarkdownString();
      md.supportHtml = true;
      md.isTrusted = true;

      const color = getColorForUtilityClass(token);
      if (color) {
        md.appendMarkdown(
          `<span style="display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid #888;background:${color};vertical-align:middle;margin-right:6px"></span>`,
        );
      }

      const inCatalog = allAeroClassNames().includes(token);
      if (inCatalog) {
        md.appendMarkdown(`**AeroCraft** \`${token}\`${color ? ` — \`${color}\`` : ''}\n\n`);
      } else if (color) {
        md.appendMarkdown(`**Color** \`${token}\` — \`${color}\`\n\n`);
      }

      if (md.value.length === 0) {
        return undefined;
      }

      return new vscode.Hover(md, range);
    },
  });

  context.subscriptions.push(aeroProvider, bearPropsProvider, hover);
}

export function deactivate(): void {}
