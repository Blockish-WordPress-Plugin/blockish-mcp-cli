import { execa } from 'execa';
import * as p from '@clack/prompts';

export async function configureClaudeCode(mcpConfig, options = {}) {
  const spinner = p.spinner();
  spinner.start('Configuring Claude Code');

  try {
    const url = mcpConfig.env.WP_API_URL;
    const user = mcpConfig.env.WP_API_USERNAME;
    const pass = mcpConfig.env.WP_API_PASSWORD;

    const addArgs = [
      'mcp', 'add', 'blockish',
      '--env', `WP_API_URL=${url}`,
      '--env', `WP_API_USERNAME=${user}`,
      '--env', `WP_API_PASSWORD=${pass}`,
      '--',
      'npx', '-y', '@automattic/mcp-wordpress-remote@latest'
    ];

    if (options.force) {
      try { await execa('claude', ['mcp', 'remove', 'blockish']); } catch (e) { /* ignore */ }
    }

    try {
      await execa('claude', addArgs);
    } catch (err) {
      const errorStr = (err.stderr || '') + (err.stdout || '') + (err.message || '');
      if (errorStr.toLowerCase().includes('already exist')) {
        if (!options.force) {
          spinner.stop('Conflict');
          const overwrite = await p.confirm({
            message: 'A "blockish" MCP server already exists in Claude Code. Overwrite?',
            initialValue: false,
          });
          if (p.isCancel(overwrite) || !overwrite) {
            p.cancel('Operation cancelled.');
            process.exit(0);
          }
          spinner.start('Updating config');
        }
        await execa('claude', ['mcp', 'remove', 'blockish']);
        await execa('claude', addArgs);
      } else {
        throw err;
      }
    }

    spinner.stop('Configuration successful');
    p.note('Your application password is stored in your Claude Code config.\nTreat it as a secret.', 'Security Warning');
    p.outro('Done! Updated config: ~/.claude.json\nPlease fully restart Claude Code to load the new tools.');
  } catch (err) {
    spinner.stop('Failed to configure automatically');
    if (err.code === 'ENOENT' || err.message.includes('not found') || (err.stderr && err.stderr.includes('command not found'))) {
      p.log.warn('The "claude" command was not found on your system.');
    } else {
      p.log.warn(`An error occurred: ${err.message}`);
    }

    const fallbackJson = {
      mcpServers: {
        blockish: mcpConfig
      }
    };

    p.note(`Please add the following block to your ~/.claude.json manually:\n\n${JSON.stringify(fallbackJson, null, 2)}`, 'Manual Configuration');
    p.outro('After adding the config, restart Claude Code.');
  }
}
