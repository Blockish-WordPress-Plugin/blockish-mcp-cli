import * as p from '@clack/prompts';
import { askForTool, askForSiteDetails } from './prompts.js';
import { buildMcpConfig } from './config.js';
import { configureClaudeDesktop } from './clients/claude-desktop.js';
import { configureCursor } from './clients/cursor.js';
import { configureAntigravity } from './clients/antigravity.js';
import { configureClaudeCode } from './clients/claude-code.js';
import { configureCodex } from './clients/codex.js';
import { configureChatGPT } from './clients/chatgpt.js';
import { configureWindsurf } from './clients/windsurf.js';
import { configureZed } from './clients/zed.js';
import { configureCline } from './clients/cline.js';
import { configureContinue } from './clients/continue.js';
import { configureCody } from './clients/cody.js';
import { configureGoose } from './clients/goose.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    tool: { type: 'string', short: 't' },
    'cursor-level': { type: 'string' },
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

  const { tool, cursorLevel } = await askForTool(values);
  const { endpointUrl, username, password } = await askForSiteDetails(values);
  
  const spinner = p.spinner();
  spinner.start('Setting up Puppeteer for browser automation (downloading Chromium)...');
  try {
    const { execa } = await import('execa');
    // Ensure Puppeteer and Chrome binaries are installed globally on the user's machine
    await execa('npm', ['install', '-g', 'puppeteer'], { stdio: 'ignore' });
    spinner.stop('Puppeteer and Chromium successfully installed globally for automation!');
  } catch (error) {
    spinner.stop('Warning: Failed to automatically download Chromium. Automation may not work until you run `npx puppeteer browsers install chrome`.');
  }

  const mcpConfig = buildMcpConfig(endpointUrl, username, password);
  const options = { force: values.force };

  switch (tool) {
    case 'claude-desktop':
      await configureClaudeDesktop(mcpConfig, options);
      break;
    case 'cursor':
      await configureCursor(mcpConfig, cursorLevel, options);
      break;
    case 'antigravity-ide':
      await configureAntigravity(mcpConfig, 'ide', options);
      break;
    case 'antigravity-cli':
      await configureAntigravity(mcpConfig, 'cli', options);
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
    case 'chatgpt':
      await configureChatGPT(mcpConfig, options);
      break;
    case 'windsurf':
      await configureWindsurf(mcpConfig, options);
      break;
    case 'zed':
      await configureZed(mcpConfig, options);
      break;
    case 'cline':
      await configureCline(mcpConfig, options);
      break;
    case 'continue':
      await configureContinue(mcpConfig, options);
      break;
    case 'cody':
      await configureCody(mcpConfig, options);
      break;
    case 'goose':
      await configureGoose(mcpConfig, options);
      break;
    default:
      p.cancel('Unknown tool selected.');
      process.exit(1);
  }
}

main().catch(console.error);
