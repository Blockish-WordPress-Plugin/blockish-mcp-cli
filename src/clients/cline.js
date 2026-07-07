import fs from 'node:fs/promises';
import path from 'node:path';
import * as p from '@clack/prompts';
import { getVSCodeConfigDir } from '../utils/paths.js';

export async function configureCline(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Cline (VS Code)');

  try {
    const vscodeDir = getVSCodeConfigDir();
    const configPath = path.join(vscodeDir, 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json');

    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    let existingConfig = {};
    try {
      const fileContent = await fs.readFile(configPath, 'utf8');
      if (fileContent.trim() !== '') {
        existingConfig = JSON.parse(fileContent);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        spinner.stop('Error reading config file');
        p.cancel(`Failed to parse existing config at ${configPath}. Error: ${err.message}`);
        process.exit(1);
      }
    }

    if (!existingConfig.mcpServers) {
      existingConfig.mcpServers = {};
    }

    if (existingConfig.mcpServers.blockish) {
      if (!options.force) {
        spinner.stop('Conflict');
        const overwrite = await p.confirm({
          message: 'A "blockish" MCP server already exists in Cline. Overwrite?',
          initialValue: false,
        });
        if (p.isCancel(overwrite) || !overwrite) {
          p.cancel('Operation cancelled.');
          process.exit(0);
        }
              spinner.start('Updating config');
      }
    }

    existingConfig.mcpServers.blockish = mcpConfig;

    await fs.writeFile(configPath, JSON.stringify(existingConfig, null, 2), 'utf8');

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.outro(`Done! Updated Cline config: ${displayPath}\nPlease fully restart VS Code.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
