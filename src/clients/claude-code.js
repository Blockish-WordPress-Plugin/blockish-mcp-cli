import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';

function hasAnyBlockish(config) {
  if (config.mcpServers?.blockish) {
    return true;
  }
  for (const project of Object.values(config.projects || {})) {
    if (project?.mcpServers?.blockish) {
      return true;
    }
  }
  return false;
}

function writeUserBlockish(config, mcpConfig) {
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  config.mcpServers.blockish = {
    type: 'stdio',
    command: mcpConfig.command,
    args: mcpConfig.args,
    env: mcpConfig.env,
  };

  for (const project of Object.values(config.projects || {})) {
    if (project?.mcpServers?.blockish) {
      delete project.mcpServers.blockish;
    }
  }
}

export async function configureClaudeCode(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Claude Code');

  try {
    const configPath = path.join(os.homedir(), '.claude.json');
    await fs.mkdir(path.dirname(configPath), { recursive: true });

    let config = {};
    try {
      const fileContent = await fs.readFile(configPath, 'utf8');
      if (fileContent.trim() !== '') {
        config = JSON.parse(fileContent);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    if (hasAnyBlockish(config) && !options.force) {
      spinner.stop('Conflict');
      const overwrite = await p.confirm({
        message: 'A "blockish" MCP server already exists in Claude Code. Overwrite and move it to user scope?',
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      spinner.start('Updating config');
    }

    writeUserBlockish(config, mcpConfig);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.note(`Your application password is stored in plaintext in the config file.\nTreat this file as a secret:\n${displayPath}`, 'Security Warning');
    p.outro(`Done! Updated user MCP in ${displayPath}\nRestart Claude Code. blockish is now available in every project.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
