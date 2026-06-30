import { execa } from 'execa';
import * as p from '@clack/prompts';

export async function configureCodex(mcpConfig) {
  const spinner = p.spinner();
  spinner.start('Configuring Codex');

  try {
    const url = mcpConfig.env.WP_API_URL;
    const user = mcpConfig.env.WP_API_USERNAME;
    const pass = mcpConfig.env.WP_API_PASSWORD;

    await execa('codex', [
      'mcp', 'add', 'blockish',
      '--env', `WP_API_URL=${url}`,
      '--env', `WP_API_USERNAME=${user}`,
      '--env', `WP_API_PASSWORD=${pass}`,
      '--',
      'npx', '-y', '@automattic/mcp-wordpress-remote@latest'
    ]);

    spinner.stop('Configuration successful');
    p.note('Your application password is stored in your Codex config.\nTreat it as a secret.', 'Security Warning');
    p.outro('Done! Updated config: ~/.codex/config.toml\nPlease fully restart Codex to load the new tools.');
  } catch (err) {
    spinner.stop('Failed to configure automatically');
    if (err.code === 'ENOENT' || err.message.includes('not found')) {
      p.log.warn('The "codex" command was not found on your system.');
    } else {
      p.log.warn(`An error occurred: ${err.message}`);
    }

    const tomlBlock = `
[mcp_servers.blockish]
command = "npx"
args = ["-y", "@automattic/mcp-wordpress-remote@latest"]

[mcp_servers.blockish.env]
WP_API_URL = "${mcpConfig.env.WP_API_URL}"
WP_API_USERNAME = "${mcpConfig.env.WP_API_USERNAME}"
WP_API_PASSWORD = "${mcpConfig.env.WP_API_PASSWORD}"
`;

    p.note(`Please append the following block to your ~/.codex/config.toml manually:\n${tomlBlock}`, 'Manual Configuration');
    p.outro('After adding the config, restart Codex.');
  }
}
