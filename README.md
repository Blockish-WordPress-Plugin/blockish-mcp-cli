# Blockish MCP CLI

A standalone Node.js command-line interface to configure Model Context Protocol (MCP) server connections for your WordPress site running Blockish (or any WordPress `mcp-adapter` plugin).

This tool interactively collects your WordPress connection details and automatically configures your preferred AI client to connect to your WordPress site via MCP.

## Supported AI Clients

- **Claude Desktop**
- **Cursor** (Global or Project-level)
- **Antigravity IDE**
- **Antigravity CLI**
- **Claude Code**
- **Codex**

## Usage

You can run this CLI tool directly via `npx` without needing to install it globally.

```bash
npx blockish-mcp-cli
```

### Interactive Prompts
1. **Select your AI client:** Choose the AI tool you want to configure.
2. **Site URL:** Enter the base URL of your WordPress site (e.g., `https://mysite.com`).
3. **WordPress username:** Enter your WordPress username.
4. **Application password:** Provide an Application Password for your WordPress user.
   > **Note:** To create an Application Password, click your user avatar in the top right corner of your WordPress dashboard, scroll to the bottom, and create an Application Password. You can also view the guide here: https://blockish.dev/app-password
5. **Custom server URL override (Optional):** By default, the CLI connects to the standard default server path (`/wp-json/mcp/mcp-adapter-default-server`). You can override this if your setup requires a custom endpoint.

## Security Warning

Your Application Password is required to authenticate your AI client with your WordPress site. This CLI tool safely writes this password into the configuration files of the AI client you select. 

> **Important:** The configuration files are stored locally on your machine in plaintext. Treat these configuration files as sensitive secrets.

## How it works under the hood

Depending on your selected AI client, this CLI uses one of two approaches:
1. **JSON Config Merging:** For tools like Claude Desktop, Cursor, and Antigravity, the CLI safely parses the client's local JSON configuration file and merges the MCP server details into the `mcpServers` object without overwriting your existing tools.
2. **Command Spawning:** For tools like Claude Code and Codex, the CLI executes their respective native configuration commands (e.g. `claude mcp add`) to add the server. If the native CLI is not found on your system, it provides a handy copy-paste fallback block for manual configuration.

## License

ISC
