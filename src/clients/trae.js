import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';
import { hasBlockishMcp, mergeBlockishMcpJson } from '../utils/mcp-json.js';

function getTraeConfigPaths() {
  const homedir = os.homedir();
  const platform = process.platform;
  const appNames = ['Trae', 'Trae CN'];

  return appNames.map((appName) => {
    if (platform === 'darwin') {
      return path.join(homedir, 'Library', 'Application Support', appName, 'User', 'mcp.json');
    }
    if (platform === 'win32') {
      return path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), appName, 'User', 'mcp.json');
    }
    return path.join(homedir, '.config', appName, 'User', 'mcp.json');
  });
}

export async function configureTrae(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Trae');

  try {
    const configPaths = getTraeConfigPaths();
    let existed = false;
    for (const configPath of configPaths) {
      existed = (await hasBlockishMcp(configPath)) || existed;
    }

    if (existed && !options.force) {
      spinner.stop('Conflict');
      const overwrite = await p.confirm({
        message: 'A "blockish" MCP server already exists in your Trae config. Overwrite?',
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
    p.note(`Your application password is stored in plaintext in the config file.\nTreat this file as a secret:\n${displayPaths}`, 'Security Warning');
    p.outro('Done! Updated Trae (and Trae CN) config.\nPlease fully restart Trae to load the new tools.');
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
