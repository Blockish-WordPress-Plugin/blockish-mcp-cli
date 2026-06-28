import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';

export async function configureAntigravity(mcpConfig, clientType) {
  const isIde = clientType === 'ide';
  const name = isIde ? 'Antigravity IDE' : 'Antigravity CLI';
  const dirName = isIde ? 'antigravity-ide' : 'antigravity';

  const spinner = p.spinner();
  spinner.start(`Configuring ${name}`);

  try {
    const configPath = path.join(os.homedir(), '.gemini', dirName, 'mcp_config.json');

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
    p.outro(`Please fully restart ${name} to load the new tools.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
