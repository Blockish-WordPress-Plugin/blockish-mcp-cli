import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';
import yaml from 'yaml';

export async function configureGoose(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Goose');

  try {
    const platform = os.platform();
    const homedir = os.homedir();
    let configPath;

    if (platform === 'win32') {
      const appData = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
      configPath = path.join(appData, 'Block', 'goose', 'config', 'config.yaml');
    } else {
      configPath = path.join(homedir, '.config', 'goose', 'config.yaml');
    }

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

    if (!existingConfig.extensions) {
      existingConfig.extensions = {};
    }

    if (existingConfig.extensions.blockish) {
      if (!options.force) {
        spinner.stop('Conflict');
        const overwrite = await p.confirm({
          message: 'A "blockish" MCP server already exists in Goose. Overwrite?',
          initialValue: false,
        });
        if (p.isCancel(overwrite) || !overwrite) {
          p.cancel('Operation cancelled.');
          process.exit(0);
        }
              spinner.start('Updating config');
      }
    }

    // Goose uses 'cmd' instead of 'command' and requires a few extra fields
    const gooseConfig = {
      name: 'blockish',
      type: 'stdio',
      cmd: mcpConfig.command,
      args: mcpConfig.args,
      env: mcpConfig.env || {},
      enabled: true
    };

    existingConfig.extensions.blockish = gooseConfig;

    await fs.writeFile(configPath, yaml.stringify(existingConfig), 'utf8');

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.outro(`Done! Updated Goose config: ${displayPath}\nPlease fully restart Goose.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
