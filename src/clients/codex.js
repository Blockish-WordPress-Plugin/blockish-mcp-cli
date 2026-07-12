import { execa } from 'execa';
import * as p from '@clack/prompts';

export async function configureCodex(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Codex');

  try {
    const url = mcpConfig.env.WP_API_URL;
    const user = mcpConfig.env.WP_API_USERNAME;
    const pass = mcpConfig.env.WP_API_PASSWORD;

    const addArgs = [
      'mcp', 'add', 'blockish',
      'npx', '-y', '@automattic/mcp-wordpress-remote@latest',
      '--env', `WP_API_URL=${url}`,
      '--env', `WP_API_USERNAME=${user}`,
      '--env', `WP_API_PASSWORD=${pass}`
    ];

    if (options.force) {
      try { await execa('codex', ['mcp', 'remove', 'blockish']); } catch (e) { /* ignore */ }
    }

    try {
      await execa('codex', addArgs);
    } catch (err) {
      const errorStr = (err.stderr || '') + (err.stdout || '') + (err.message || '');
      if (errorStr.toLowerCase().includes('already exist')) {
        if (!options.force) {
          spinner.stop('Conflict');
          const overwrite = await p.confirm({
            message: 'A "blockish" MCP server already exists in Codex. Overwrite?',
            initialValue: false,
          });
          if (p.isCancel(overwrite) || !overwrite) {
            p.cancel('Operation cancelled.');
            process.exit(0);
          }
          spinner.start('Updating config');
        }
        await execa('codex', ['mcp', 'remove', 'blockish']);
        await execa('codex', addArgs);
      } else {
        throw err;
      }
    }

    spinner.stop('Configuration successful');
    p.note('Your application password is stored in your Codex config.\nTreat it as a secret.', 'Security Warning');
    p.outro('Done! Updated config: ~/.codex/config.toml\nPlease fully restart Codex to load the new tools.');
  } catch (err) {
    spinner.stop('Failed to configure automatically');
    if (err.code === 'ENOENT' || err.message.includes('not found') || (err.stderr && err.stderr.includes('command not found'))) {
      p.log.warn('The "codex" command was not found on your system.');
    } else {
      p.log.warn(`An error occurred: ${err.message}`);
    }

    const tomlBlock = `
[mcpServers.blockish]
command = "npx"
args = ["-y", "@automattic/mcp-wordpress-remote@latest"]
[mcpServers.blockish.env]
WP_API_URL = "${mcpConfig.env.WP_API_URL}"
WP_API_USERNAME = "${mcpConfig.env.WP_API_USERNAME}"
WP_API_PASSWORD = "${mcpConfig.env.WP_API_PASSWORD}"
`;

    p.note(`Please append the following block to your ~/.codex/config.toml manually:\n${tomlBlock}`, 'Manual Configuration');
    p.outro('After adding the config, restart Codex.');
  }
}
