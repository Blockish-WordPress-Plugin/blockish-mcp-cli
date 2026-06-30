import { execSync } from 'node:child_process';
import os from 'node:os';

function getNpxPath() {
  try {
    const isWin = os.platform() === 'win32';
    const cmd = isWin ? 'where npx' : 'which npx';
    const result = execSync(cmd, { encoding: 'utf8' }).split('\n')[0].trim();
    return result || 'npx';
  } catch {
    return 'npx';
  }
}

export function buildMcpConfig(endpointUrl, username, password) {
  return {
    command: process.execPath,
    args: [getNpxPath(), "-y", "@automattic/mcp-wordpress-remote@latest"],
    env: {
      "WP_API_URL": endpointUrl,
      "WP_API_USERNAME": username,
      "WP_API_PASSWORD": password
    }
  };
}
