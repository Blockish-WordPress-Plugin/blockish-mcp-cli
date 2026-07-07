import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';
import yaml from 'yaml';

export async function configureContinue(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Continue.dev');

  try {
    const homedir = os.homedir();
    const configPath = path.join(homedir, '.continue', 'config.yaml');

    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    let existingConfig = {};
    try {
      const fileContent = await fs.readFile(configPath, 'utf8');
      if (fileContent.trim() !== '') {
        existingConfig = yaml.parse(fileContent);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        spinner.stop('Error reading config file');
        p.cancel(`Failed to parse existing config at ${configPath}. Error: ${err.message}`);
        process.exit(1);
      }
    }

    if (!existingConfig.mcpServers) {
      existingConfig.mcpServers = [];
    }

    // Continue uses an array for mcpServers
    const existingIndex = existingConfig.mcpServers.findIndex(s => s.name === 'blockish');

    if (existingIndex !== -1) {
      if (!options.force) {
        spinner.stop('Conflict');
        const overwrite = await p.confirm({
          message: 'A "blockish" MCP server already exists in Continue.dev. Overwrite?',
          initialValue: false,
        });
        if (p.isCancel(overwrite) || !overwrite) {
          p.cancel('Operation cancelled.');
          process.exit(0);
        }
        spinner.start('Updating config');
              }
      existingConfig.mcpServers[existingIndex] = { name: 'blockish', ...mcpConfig };
    } else {
      existingConfig.mcpServers.push({ name: 'blockish', ...mcpConfig });
    }

    await fs.writeFile(configPath, yaml.stringify(existingConfig), 'utf8');

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.outro(`Done! Updated Continue config: ${displayPath}\nPlease restart Continue agent to load the new tools.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
