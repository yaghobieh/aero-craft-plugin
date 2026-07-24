import * as vscode from 'vscode';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

const CONFIG_GLOB = '**/aerocraft.config.{js,mjs,cjs,ts}';

export async function loadWorkspaceAeroConfig(): Promise<Record<string, unknown> | null> {
  const files = await vscode.workspace.findFiles(CONFIG_GLOB, '**/node_modules/**', 1);
  if (files.length === 0) return null;
  const file = files[0];
  try {
    if (file.path.endsWith('.ts')) {
      const text = await vscode.workspace.fs.readFile(file);
      const raw = Buffer.from(text).toString('utf8');
      const prefix = raw.match(/prefix\s*:\s*['"]([^'"]+)['"]/)?.[1];
      const separator = raw.match(/separator\s*:\s*['"]([^'"]+)['"]/)?.[1];
      const config: Record<string, unknown> = {};
      if (prefix) config.prefix = prefix;
      if (separator) config.separator = separator;
      return Object.keys(config).length > 0 ? config : null;
    }
    const mod = await import(pathToFileURL(file.fsPath).href);
    const config = (mod.default ?? mod) as Record<string, unknown>;
    return config && typeof config === 'object' ? config : null;
  } catch {
    try {
      const text = await vscode.workspace.fs.readFile(file);
      const raw = Buffer.from(text).toString('utf8');
      const prefix = raw.match(/prefix\s*:\s*['"]([^'"]+)['"]/)?.[1];
      const separator = raw.match(/separator\s*:\s*['"]([^'"]+)['"]/)?.[1];
      const config: Record<string, unknown> = {};
      if (prefix) config.prefix = prefix;
      if (separator) config.separator = separator;
      return Object.keys(config).length > 0 ? config : null;
    } catch {
      return null;
    }
  }
}

export function configCacheKey(config: Record<string, unknown> | null): string {
  return JSON.stringify({
    prefix: config?.prefix ?? '',
    separator: config?.separator ?? '-',
    cwd: path.basename(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? ''),
  });
}
