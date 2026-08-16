import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import * as p from '@clack/prompts';

function tomlQuote(value) {
  return JSON.stringify(String(value));
}

function buildBlockishToml(mcpConfig) {
  return `[mcp_servers.blockish]
command = "npx"
args = [
    "-y",
    "@automattic/mcp-wordpress-remote@latest"
]

[mcp_servers.blockish.env]
WP_API_URL = ${tomlQuote(mcpConfig.env.WP_API_URL)}
WP_API_USERNAME = ${tomlQuote(mcpConfig.env.WP_API_USERNAME)}
WP_API_PASSWORD = ${tomlQuote(mcpConfig.env.WP_API_PASSWORD)}
`;
}

function upsertBlockish(content, mcpConfig) {
  const block = buildBlockishToml(mcpConfig).trimEnd();
  const existing = /\[mcp_servers\.blockish\][\s\S]*?(?=\n\[(?!mcp_servers\.blockish)|$)/;

  if (existing.test(content)) {
    return content.replace(existing, `${block}\n`);
  }

  const customMarker = '# --- Custom External MCP Servers ---';
  if (content.includes(customMarker)) {
    return content.replace(customMarker, `${customMarker}\n${block}\n`);
  }

  if (content.includes('[mcp_servers]')) {
    return content.replace('[mcp_servers]', `[mcp_servers]\n\n${block}`);
  }

  return `${content.trimEnd()}\n\n${block}\n`;
}

export async function configureCodex(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Codex');

  try {
    const configPath = path.join(os.homedir(), '.codex', 'config.toml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });

    let content = '';
    try {
      content = await fs.readFile(configPath, 'utf8');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    const existed = /\[mcp_servers\.blockish\]/.test(content);
    if (existed && !options.force) {
      spinner.stop('Conflict');
      const overwrite = await p.confirm({
        message: 'A "blockish" MCP server already exists in your Codex config. Overwrite?',
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      spinner.start('Updating config');
    }

    const next = content.trim() === ''
      ? `${buildBlockishToml(mcpConfig)}\n`
      : upsertBlockish(content, mcpConfig);

    await fs.writeFile(configPath, next, 'utf8');

    spinner.stop('Configuration successful');
    const { pathToFileURL } = await import('node:url');
    const displayPath = pathToFileURL(configPath).href;
    p.note(`Your application password is stored in plaintext in the config file.\nTreat this file as a secret:\n${displayPath}`, 'Security Warning');
    p.outro(`Done! Updated config: ${displayPath}\nPlease fully restart Codex / ChatGPT to load the new tools.`);
  } catch (err) {
    spinner.stop('Failed to configure');
    p.cancel(`An error occurred: ${err.message}`);
    process.exit(1);
  }
}
