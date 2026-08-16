import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';
import { hasBlockishMcp, mergeBlockishMcpJson } from '../utils/mcp-json.js';

function getWindsurfConfigPaths() {
  const homedir = os.homedir();
  const root = process.platform === 'win32'
    ? (process.env.USERPROFILE || homedir)
    : homedir;

  return [
    path.join(root, '.codeium', 'windsurf', 'mcp_config.json'),
    path.join(root, '.codeium', 'mcp_config.json'),
  ];
}

export async function configureWindsurf(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Devin (Windsurf)');

  try {
    const configPaths = getWindsurfConfigPaths();
    let existed = false;
    for (const configPath of configPaths) {
      existed = (await hasBlockishMcp(configPath)) || existed;
    }

    if (existed && !options.force) {
      spinner.stop('Conflict');
      const overwrite = await p.confirm({
        message: 'A "blockish" MCP server already exists in Devin (Windsurf). Overwrite?',
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      spinner.start('Updating config');
    }

    for (const configPath of configPaths) {
      await mergeBlockishMcpJson(configPath, mcpConfig);
    }

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPaths = configPaths.map((configPath) => pathToFileURL(configPath).href).join('\n');
    p.outro(`Done! Updated Devin (Windsurf) config:\n${displayPaths}\nPlease fully restart Devin.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
