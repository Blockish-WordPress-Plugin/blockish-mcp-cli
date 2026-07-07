import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';

export async function configureWindsurf(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Windsurf');

  try {
    const platform = os.platform();
    const homedir = os.homedir();
    let configPath;
    
    if (platform === 'win32') {
      const userProfile = process.env.USERPROFILE || homedir;
      configPath = path.join(userProfile, '.codeium', 'windsurf', 'mcp_config.json');
    } else {
      configPath = path.join(homedir, '.codeium', 'windsurf', 'mcp_config.json');
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
          message: 'A "blockish" MCP server already exists in Windsurf. Overwrite?',
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
    p.outro(`Done! Updated Windsurf config: ${displayPath}\nPlease fully restart Windsurf.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
