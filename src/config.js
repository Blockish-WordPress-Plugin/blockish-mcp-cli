export function buildMcpConfig(endpointUrl, username, password) {
  return {
    command: "npx",
    args: ["-y", "@automattic/mcp-wordpress-remote@latest"],
    env: {
      "WP_API_URL": endpointUrl,
      "WP_API_USERNAME": username,
      "WP_API_PASSWORD": password
    }
  };
}
