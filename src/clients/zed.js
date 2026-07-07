import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';

export async function configureZed(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Zed');

  try {
    const configPath = path.join(os.homedir(), '.config', 'zed', 'settings.json');

    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    let existingConfig = {};
    try {
      const fileContent = await fs.readFile(configPath, 'utf8');
      if (fileContent.trim() !== '') {
        // Strip out single-line and multi-line comments for JSON parsing
        const stripped = fileContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
        existingConfig = JSON.parse(stripped);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        spinner.stop('Error reading config file');
        p.cancel(`Failed to parse existing config at ${configPath}. Please ensure it is valid JSON. Error: ${err.message}`);
        process.exit(1);
      }
    }

    if (!existingConfig.context_servers) {
      existingConfig.context_servers = {};
    }

    if (existingConfig.context_servers.blockish) {
      if (!options.force) {
        spinner.stop('Conflict');
        const overwrite = await p.confirm({
          message: 'A "blockish" MCP server already exists in Zed. Overwrite?',
          initialValue: false,
        });
        if (p.isCancel(overwrite) || !overwrite) {
          p.cancel('Operation cancelled.');
          process.exit(0);
        }
              spinner.start('Updating config');
      }
    }

    existingConfig.context_servers.blockish = mcpConfig;

    await fs.writeFile(configPath, JSON.stringify(existingConfig, null, 2), 'utf8');

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.outro(`Done! Updated Zed config: ${displayPath}\nPlease fully restart Zed.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
