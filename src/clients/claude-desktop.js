import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';

export async function configureClaudeDesktop(mcpConfig) {
  const spinner = p.spinner();
  spinner.start('Configuring Claude Desktop');

  try {
    let configPath;
    const platform = process.platform;
    const homedir = os.homedir();

    if (platform === 'darwin') {
      configPath = path.join(homedir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    } else if (platform === 'win32') {
      configPath = path.join(process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
    } else {
      configPath = path.join(homedir, '.config', 'Claude', 'claude_desktop_config.json');
    }

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
        p.cancel(`Failed to parse existing config at ${configPath}. Is it valid JSON? Error: ${err.message}`);
        process.exit(1);
      }
    }

    if (!existingConfig.mcpServers) {
      existingConfig.mcpServers = {};
    }

    if (existingConfig.mcpServers.blockish) {
      spinner.stop('Conflict');
      const overwrite = await p.confirm({
        message: 'A "blockish" MCP server already exists in your config. Overwrite?',
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      spinner.start('Updating config');
    }

    existingConfig.mcpServers.blockish = mcpConfig;

    await fs.writeFile(configPath, JSON.stringify(existingConfig, null, 2), 'utf8');

    spinner.stop('Configuration successful');
    p.note(`Your application password is stored in plaintext in the config file.\nTreat this file as a secret:\n${configPath}`, 'Security Warning');
    p.outro('Please fully restart Claude Desktop to load the new tools.');
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
