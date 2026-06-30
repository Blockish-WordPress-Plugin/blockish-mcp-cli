import * as p from '@clack/prompts';
import { askForTool, askForSiteDetails } from './prompts.js';
import { buildMcpConfig } from './config.js';
import { configureClaudeDesktop } from './clients/claude-desktop.js';
import { configureCursor } from './clients/cursor.js';
import { configureAntigravity } from './clients/antigravity.js';
import { configureClaudeCode } from './clients/claude-code.js';
import { configureCodex } from './clients/codex.js';
import { configureChatGPT } from './clients/chatgpt.js';

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));

async function main() {
  p.intro(`Blockish MCP Server Configuration v${pkg.version}`);

  const { tool, cursorLevel } = await askForTool();
  const { endpointUrl, username, password } = await askForSiteDetails();
  
  const mcpConfig = buildMcpConfig(endpointUrl, username, password);

  switch (tool) {
    case 'claude-desktop':
      await configureClaudeDesktop(mcpConfig);
      break;
    case 'cursor':
      await configureCursor(mcpConfig, cursorLevel);
      break;
    case 'antigravity-ide':
      await configureAntigravity(mcpConfig, 'ide');
      break;
    case 'antigravity-cli':
      await configureAntigravity(mcpConfig, 'cli');
      break;
    case 'claude-code':
      await configureClaudeCode(mcpConfig);
      break;
    case 'codex':
      await configureCodex(mcpConfig);
      break;
    case 'chatgpt':
      await configureChatGPT(mcpConfig);
      break;
    default:
      p.cancel('Unknown tool selected.');
      process.exit(1);
  }
}

main().catch(console.error);
