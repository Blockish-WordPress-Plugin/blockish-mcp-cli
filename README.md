# Blockish MCP CLI

A standalone Node.js command-line interface to configure Model Context Protocol (MCP) server connections for your WordPress site running Blockish (or any WordPress `mcp-adapter` plugin).

This tool interactively collects your WordPress connection details and automatically configures your preferred AI client to connect to your WordPress site via MCP.

## Supported AI Clients

Clients that reliably run **local stdio MCP tools** (the setup Blockish uses):

- **Cursor**
- **Claude Desktop**
- **Claude Code**
- **Codex**
- **Devin (Windsurf)**
- **Antigravity** (IDE and CLI share `~/.gemini/config/mcp_config.json`)
- **Antigravity Chat** (`~/.gemini/antigravity/mcp_config.json`)
- **Cline** (VS Code)
- **Trae**
- **Qwen Code**
- **Kimi Code**

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
   > **Note:** To create an Application Password, click your user avatar in the top right corner of your WordPress dashboard, scroll to the bottom, and create an Application Password.
5. **Custom server URL override (Optional):** By default, the CLI connects to the standard default server path (`/wp-json/mcp/mcp-adapter-default-server`). You can override this if your setup requires a custom endpoint.

### Non-Interactive (Automation) Mode

You can completely bypass the interactive prompts by passing your details via command-line flags. This is perfect for CI/CD pipelines or automated setup scripts.

| Flag | Full Name | Description |
| :--- | :--- | :--- |
| `-t` | `--tool` | The AI client identifier (`cursor`, `claude-desktop`, `claude-code`, `codex`, `devin`, `antigravity`, `antigravity-chat`, `cline`, `trae`, `qwen-code`, `kimi-code`) |
| `-s` | `--siteUrl` | The base URL of your WordPress site |
| `-u` | `--username` | Your WordPress username |
| `-p` | `--password` | Your Application Password |
| `-c` | `--customUrl` | Optional custom endpoint URL override |
| `-f` | `--force` | Skip the "Overwrite?" confirmation if a configuration already exists |

**Example:**
```bash
npx blockish-mcp-cli -t cursor -s https://example.com -u admin -p "secretpass123" --force
```

## Security Warning

Your Application Password is required to authenticate your AI client with your WordPress site. This CLI tool safely writes this password into the configuration files of the AI client you select.

> **Important:** The configuration files are stored locally on your machine in plaintext. Treat these configuration files as sensitive secrets.

## How it works under the hood

Depending on your selected AI client, this CLI uses one of two approaches:
1. **JSON Config Merging:** For tools like Claude Desktop, Cursor, Devin (Windsurf), Cline, Antigravity, Trae, Qwen Code, and Kimi Code, the CLI safely parses the client's local JSON configuration file and merges the MCP server details into the `mcpServers` object without overwriting your existing tools.
2. **Command Spawning:** For Claude Code and Codex, the CLI executes their native configuration commands (e.g. `claude mcp add`) to add the server. If the native CLI is not found on your system, it provides a copy-paste fallback block for manual configuration.

## License

ISC
