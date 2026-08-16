import * as p from '@clack/prompts';

export async function askForTool(prefilled = {}) {
  let tool = prefilled.tool;
  if (!tool) {
    tool = await p.select({
      message: 'Select your AI client:',
    options: [
      { value: 'cursor', label: 'Cursor' },
      { value: 'claude-desktop', label: 'Claude Desktop' },
      { value: 'claude-code', label: 'Claude Code' },
      { value: 'codex', label: 'Codex' },
      { value: 'devin', label: 'Devin (Windsurf)' },
      { value: 'antigravity', label: 'Antigravity' },
      { value: 'antigravity-chat', label: 'Antigravity Chat' },
      { value: 'cline', label: 'Cline (VS Code)' },
      { value: 'trae', label: 'Trae' },
      { value: 'qwen-code', label: 'Qwen Code' },
      { value: 'kimi-code', label: 'Kimi Code' },
    ],
  });
  }

  if (!prefilled.tool && p.isCancel(tool)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  return { tool };
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
