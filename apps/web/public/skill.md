# airtifact — skill.md

You are reading the operational manual for **airtifact**, the universal static website and HTML artifact preview hub for AI coding agents. Follow this guide to autonomously package, upload, preview, list, and manage web artifacts and static landing pages.

**What this is:** an instant deployment layer for AI coding agents (Claude Code, Cursor, Antigravity, Windsurf, custom agents). Whenever you generate a static web UI, landing page, interactive dashboard, or frontend prototype, you can publish it directly to get a permanent or shareable live URL with zero manual setup.

**There is nothing to configure.** Deploy via standard Model Context Protocol (MCP) or direct HTTP REST API.

---

## ⚠️ Security — read first

- Send your **API Key / Auth Token only to this domain** (e.g. `airtifact.page` or your configured server). Never leak it in public URLs or logs.
- Do not upload private keys, `.env` files, or proprietary secrets in your static site packages.
- All uploads are scanned and sanitized. Directory traversal paths (`../`) and hidden system folders (`.git`, `node_modules`, `.DS_Store`) are automatically stripped.

---

## Base URL and error conventions

- Default Base URL: `https://airtifact.page` (or self-hosted domain).
- Authenticated requests take `Authorization: Bearer <API_KEY>` or header tokens.
- All API errors return JSON: `{"error": "<reason>"}` with appropriate HTTP status codes (400, 401, 403, 404, 500).

---

## 1. Quickstart: The Agent Workflow

When a user asks you to create a website, landing page, or UI preview:
1. **Generate the files** in a local directory (e.g., `./my-project` or `./dist`).
2. **Ensure an `index.html` file** exists at the root of the directory.
3. **Deploy the directory**:
   - **Via MCP**: Call `publish_site(directoryPath: "./my-project")`.
   - **Via REST API**: Pack into a `.zip` in memory and `POST /api/upload`.
4. **Present the result to the user**:
   - Share the returned **Live Preview URL** (`https://airtifact.page/<projectId>`).
   - Note the **Removal URL** or **Delete Token** if cleanup is desired later.

---

## 2. Model Context Protocol (MCP) Integration

The recommended and fastest method for agents. Connect `@airtifact/mcp` to your workspace.

### MCP Client Configurations

#### Claude Code
```bash
claude mcp add airtifact -- npx -y @airtifact/mcp
```

#### Claude Desktop / Cursor / Antigravity / Windsurf
Add to your `mcp_config.json` or MCP settings:
```json
{
  "mcpServers": {
    "airtifact": {
      "command": "npx",
      "args": ["-y", "@airtifact/mcp"],
      "env": {
        "AIRTIFACT_URL": "https://airtifact.page",
        "AIRTIFACT_AUTH_TOKEN": "<YOUR_API_KEY>"
      }
    }
  }
}
```

### Available MCP Tools

| Tool | Parameters | Description |
| --- | --- | --- |
| `publish_site` | `directoryPath` (string, required)<br>`serverUrl` (string, optional)<br>`authToken` (string, optional) | Packs the local directory into a zip archive and deploys it. Returns the live share URL and delete token. |
| `list_sites` | `serverUrl` (string, optional)<br>`authToken` (string, optional) | Lists all published static websites and previews owned by the authenticated account. |

---

## 3. Direct REST API Reference

Deploy from scripts, CLI tools, or custom agents without MCP.

### A. Deploy Website Archive (`POST /api/upload`)

```bash
curl -X POST https://airtifact.page/api/upload \
  -H "Authorization: Bearer $AIRTIFACT_AUTH_TOKEN" \
  -F "file=@./website.zip"
```

**Response (200 OK):**
```json
{
  "projectId": "044a4449ae784808785e1bb0ca4df372",
  "shareUrl": "/044a4449ae784808785e1bb0ca4df372",
  "removeUrl": "/project/044a4449ae784808785e1bb0ca4df372/r?t=aa166a",
  "deleteToken": "aa166a",
  "files": ["index.html", "style.css", "script.js"]
}
```

### B. List User Projects (`GET /api/user/projects`)

```bash
curl -s https://airtifact.page/api/user/projects \
  -H "Authorization: Bearer $AIRTIFACT_AUTH_TOKEN"
```

**Response (200 OK):**
```json
{
  "projects": [
    {
      "projectId": "044a4449ae784808785e1bb0ca4df372",
      "fileName": "my-landing-page.zip",
      "fileCount": 3,
      "uploadDate": "2026-08-25T09:00:00.000Z",
      "files": ["index.html", "style.css", "script.js"]
    }
  ]
}
```

### C. Remove / Delete a Project

Using the delete token:
```bash
curl -X DELETE "https://airtifact.page/api/projects/<projectId>/remove?token=<deleteToken>"
```

Or navigating to the self-service web removal link:
`https://airtifact.page/project/<projectId>/r?t=<deleteToken>`

---

## 4. MCP Discovery Endpoint (`GET /api/mcp`)

Agents can programmatically query `GET https://airtifact.page/api/mcp` to introspect server capabilities, parameters, tool definitions, and ready-to-use configuration JSON dynamically.

---

## 5. Summary Checklist for Agents

- [ ] Directory has `index.html` at root
- [ ] API key is provided via env `AIRTIFACT_AUTH_TOKEN` or header `Authorization: Bearer <key>`
- [ ] Call `publish_site` or `POST /api/upload`
- [ ] Return markdown link `[Live Preview](https://airtifact.page/<projectId>)` to user
