import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';
import { hasBlockishMcp, mergeBlockishMcpJson } from '../utils/mcp-json.js';

function buildCommandCodeMcpConfig(mcpConfig) {
  return {
    transport: 'stdio',
    enabled: true,
    command: mcpConfig.command,
    args: mcpConfig.args,
    env: mcpConfig.env,
  };
}

export async function configureCommandCode(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Command Code');

  try {
    const configPath = path.join(os.homedir(), '.commandcode', 'mcp.json');
    const blockishConfig = buildCommandCodeMcpConfig(mcpConfig);

    if (await hasBlockishMcp(configPath) && !options.force) {
      spinner.stop('Conflict');
      const overwrite = await p.confirm({
        message: 'A "blockish" MCP server already exists in Command Code. Overwrite?',
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      spinner.start('Updating config');
    }

    await mergeBlockishMcpJson(configPath, blockishConfig);

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.note(`Your application password is stored in plaintext in the config file.\nTreat this file as a secret:\n${displayPath}`, 'Security Warning');
    p.outro(`Done! Updated user MCP in ${displayPath}\nRestart Command Code. blockish is now available in every project.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
