import * as p from '@clack/prompts';
import { askForTool, askForSiteDetails } from './prompts.js';
import { buildMcpConfig } from './config.js';
import { configureClaudeDesktop } from './clients/claude-desktop.js';
import { configureCursor } from './clients/cursor.js';
import { configureAntigravity } from './clients/antigravity.js';
import { configureClaudeCode } from './clients/claude-code.js';
import { configureCodex } from './clients/codex.js';
import { configureWindsurf } from './clients/windsurf.js';
import { configureCline } from './clients/cline.js';
import { configureTrae } from './clients/trae.js';
import { configureQwenCode } from './clients/qwen-code.js';
import { configureKimiCode } from './clients/kimi-code.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    tool: { type: 'string', short: 't' },
    siteUrl: { type: 'string', short: 's' },
    username: { type: 'string', short: 'u' },
    password: { type: 'string', short: 'p' },
    customUrl: { type: 'string', short: 'c' },
    force: { type: 'boolean', short: 'f' },
  },
  strict: false,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));

async function main() {
  p.intro(`Blockish MCP Server Configuration v${pkg.version}`);

  const { tool } = await askForTool(values);
  const { endpointUrl, username, password } = await askForSiteDetails(values);

  const mcpConfig = buildMcpConfig(endpointUrl, username, password);
  const options = { force: values.force };

  switch (tool) {
    case 'claude-desktop':
      await configureClaudeDesktop(mcpConfig, options);
      break;
    case 'cursor':
      await configureCursor(mcpConfig, options);
      break;
    case 'antigravity':
    case 'antigravity-ide':
    case 'antigravity-cli':
      await configureAntigravity(mcpConfig, 'ide', options);
      break;
    case 'antigravity-chat':
      await configureAntigravity(mcpConfig, 'chat', options);
      break;
    case 'claude-code':
      await configureClaudeCode(mcpConfig, options);
      break;
    case 'codex':
      await configureCodex(mcpConfig, options);
      break;
    case 'devin':
    case 'windsurf':
      await configureWindsurf(mcpConfig, options);
      break;
    case 'cline':
      await configureCline(mcpConfig, options);
      break;
    case 'trae':
      await configureTrae(mcpConfig, options);
      break;
    case 'qwen-code':
      await configureQwenCode(mcpConfig, options);
      break;
    case 'kimi-code':
      await configureKimiCode(mcpConfig, options);
      break;
    default:
      p.cancel('Unknown tool selected.');
      process.exit(1);
  }
}

main().catch(console.error);
