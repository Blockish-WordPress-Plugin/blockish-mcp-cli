import * as p from '@clack/prompts';

export async function configureChatGPT(mcpConfig) {
  const spinner = p.spinner();
  spinner.start('Preparing ChatGPT configuration');
  spinner.stop('Ready for manual setup');

  p.note(
    `Unlike other clients, ChatGPT Desktop does not use a local configuration file.\n` +
    `You must add this server manually through the ChatGPT app interface.\n\n` +
    `1. Open the ChatGPT Desktop app.\n` +
    `2. Click your profile icon and go to Settings -> MCP Servers (or Apps & Connectors).\n` +
    `3. Click "Add New Server" or "Create".\n` +
    `4. Enter the following details:\n\n` +
    `   Server Name: Blockish\n` +
    `   Server URL:  ${mcpConfig.env.WP_API_URL}\n\n` +
    `* Note: ChatGPT requires your WordPress site to have an HTTPS URL.`,
    'ChatGPT Configuration Steps'
  );

  p.outro('After adding the server in ChatGPT, you are ready to go!');
}
