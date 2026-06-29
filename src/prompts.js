import * as p from '@clack/prompts';

export async function askForTool() {
  const tool = await p.select({
    message: 'Select your AI client:',
    options: [
      { value: 'claude-desktop', label: 'Claude Desktop' },
      { value: 'claude-code', label: 'Claude Code' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'codex', label: 'Codex' },
      { value: 'chatgpt', label: 'ChatGPT Desktop' },
      { value: 'antigravity-ide', label: 'Antigravity IDE' },
      { value: 'antigravity-cli', label: 'Antigravity CLI' },
    ],
  });

  if (p.isCancel(tool)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  let cursorLevel = 'global';
  if (tool === 'cursor') {
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

export async function askForSiteDetails() {
  const siteUrl = await p.text({
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

  if (p.isCancel(siteUrl)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  const username = await p.text({
    message: 'WordPress username',
    validate: (value) => {
      if (!value) return 'Please enter a username';
    }
  });

  if (p.isCancel(username)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  p.note('Click your user avatar in the top right corner, scroll to the bottom, and create an Application Password.\nGuide: https://blockish.dev/app-password', 'Hint');

  const password = await p.password({
    message: 'Application password',
    mask: '*',
    validate: (value) => {
      if (!value) return 'Please enter a password';
    }
  });

  if (p.isCancel(password)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const advanced = await p.confirm({
    message: 'Do you want to provide a custom server URL override? (Default is standard Blockish/MCP path)',
    initialValue: false,
  });

  if (p.isCancel(advanced)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  let endpointUrl = `${cleanSiteUrl}/wp-json/mcp/mcp-adapter-default-server`;

  if (advanced) {
    const customUrl = await p.text({
      message: 'Custom server URL',
      placeholder: endpointUrl,
      validate: (value) => {
        if (!value) return 'Please enter a custom URL';
      }
    });

    if (p.isCancel(customUrl)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    endpointUrl = customUrl;
  }

  return { endpointUrl, username, password: password.replace(/\\s+/g, '') };
}
