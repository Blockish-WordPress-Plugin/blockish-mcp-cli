import * as p from '@clack/prompts';

export async function askForTool(prefilled = {}) {
  let tool = prefilled.tool;
  if (!tool) {
    tool = await p.select({
      message: 'Select your AI client:',
    options: [
      { value: 'claude-desktop', label: 'Claude Desktop' },
      { value: 'claude-code', label: 'Claude Code' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'codex', label: 'Codex' },
      { value: 'chatgpt', label: 'ChatGPT Desktop' },
      { value: 'windsurf', label: 'Windsurf IDE' },
      { value: 'zed', label: 'Zed Editor' },
      { value: 'cline', label: 'Cline (VS Code)' },
      { value: 'continue', label: 'Continue.dev' },
      { value: 'cody', label: 'Sourcegraph Cody' },
      { value: 'goose', label: 'Goose' },
      { value: 'antigravity-ide', label: 'Antigravity IDE' },
      { value: 'antigravity-cli', label: 'Antigravity CLI' },
      { value: 'antigravity-chat', label: 'Antigravity Chat' },
    ],
  });
  }

  if (!prefilled.tool && p.isCancel(tool)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  let cursorLevel = prefilled['cursor-level'] || 'global';
  if (tool === 'cursor' && !prefilled['cursor-level']) {
    const level = await p.select({
      message: 'Configure Cursor globally or for the current project?',
      options: [
        { value: 'global', label: 'Global (~/.cursor/mcp.json)' },
        { value: 'project', label: 'Current Project (./.cursor/mcp.json)' }
      ]
    });

    if (p.isCancel(level)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    cursorLevel = level;
  }

  return { tool, cursorLevel };
}

export async function askForSiteDetails(prefilled = {}) {
  let siteUrl = prefilled.siteUrl;
  if (!siteUrl) {
    siteUrl = await p.text({
      message: 'Site URL',
    placeholder: 'https://mysite.com',
    validate: (value) => {
      if (!value) return 'Please enter a URL';
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL';
      }
    },
  });
  }

  if (!prefilled.siteUrl && p.isCancel(siteUrl)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  let username = prefilled.username;
  if (!username) {
    username = await p.text({
      message: 'WordPress username',
    validate: (value) => {
      if (!value) return 'Please enter a username';
    }
  });
  }

  if (!prefilled.username && p.isCancel(username)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  let password = prefilled.password;
  if (!password) {
    p.note('Click your user avatar in the top right corner, scroll to the bottom, and create an Application Password.\nGuide: https://blockish.dev/app-password', 'Hint');

    password = await p.password({
      message: 'Application password',
    mask: '*',
    validate: (value) => {
      if (!value) return 'Please enter a password';
    }
  });
  }

  if (!prefilled.password && p.isCancel(password)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  let endpointUrl = prefilled.customUrl || `${cleanSiteUrl}/wp-json/mcp/mcp-adapter-default-server`;

  return { endpointUrl, username, password: password.replace(/\s+/g, '') };
}
