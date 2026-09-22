import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';
import { hasBlockishMcp, mergeBlockishMcpJson } from '../utils/mcp-json.js';

const SERVERS_KEY = 'mcp';

function getOpenCodeConfigPath() {
  const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(configDir, 'opencode', 'opencode.json');
}

function buildOpenCodeMcpConfig(mcpConfig) {
  return {
    type: 'local',
    enabled: true,
    command: [mcpConfig.command, ...mcpConfig.args],
    environment: mcpConfig.env,
  };
}

export async function configureOpenCode(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring OpenCode');

  try {
    const configPath = getOpenCodeConfigPath();
    const blockishConfig = buildOpenCodeMcpConfig(mcpConfig);

    if (await hasBlockishMcp(configPath, SERVERS_KEY) && !options.force) {
      spinner.stop('Conflict');
      const overwrite = await p.confirm({
        message: 'A "blockish" MCP server already exists in OpenCode. Overwrite?',
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      spinner.start('Updating config');
    }

    await mergeBlockishMcpJson(configPath, blockishConfig, SERVERS_KEY);

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.note(`Your application password is stored in plaintext in the config file.\nTreat this file as a secret:\n${displayPath}`, 'Security Warning');
    p.outro(`Done! Updated global MCP config in ${displayPath}\nRestart OpenCode. blockish is now available in every project.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
