import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin || 'https://airtifact.page';

  const mcpManifest = {
    name: 'airtifact',
    what: 'MCP server and universal static deployment hub for AI coding agents — deploy live preview links directly from agent workspaces.',
    protocol: 'Model Context Protocol',
    transport: 'stdio',
    package: '@airtifact/mcp',
    endpoint: `${origin}/api/mcp`,
    instructions: `airtifact — universal static website & artifact preview hub for AI coding agents.
When you build or modify web artifacts, landing pages, interactive apps, or HTML mockups:
1. Ensure the directory contains an 'index.html' file at its root.
2. Use the 'publish_site' MCP tool (or POST /api/upload) to upload and generate a live preview link.
3. Share the resulting live URL with the user.
4. Use 'list_sites' to view all active deployed artifacts and their live links.
Full agent guidelines: ${origin}/skill.md`,
    auth: 'API Key / Auth Token sent as `Authorization: Bearer <API_KEY>` or configured via `AIRTIFACT_AUTH_TOKEN` environment variable.',
    tools: [
      {
        name: 'publish_site',
        title: 'Publish static website',
        description:
          'Publishes a local directory containing a static website (with index.html at root) to airtifact to get a live preview URL.',
        requiresAuth: true,
        parameters: {
          directoryPath: {
            type: 'string',
            description:
              'The absolute path to the local directory containing the static website files to upload.',
            required: true,
          },
          serverUrl: {
            type: 'string',
            description: `Target airtifact server URL (defaults to ${origin}).`,
            required: false,
          },
          authToken: {
            type: 'string',
            description:
              'API Auth Token for authorization (defaults to AIRTIFACT_AUTH_TOKEN environment variable).',
            required: false,
          },
        },
      },
      {
        name: 'list_sites',
        title: 'List published websites',
        description:
          'Lists all published static websites and preview links owned by the authenticated user.',
        requiresAuth: true,
        parameters: {
          serverUrl: {
            type: 'string',
            description: `Target airtifact server URL (defaults to ${origin}).`,
            required: false,
          },
          authToken: {
            type: 'string',
            description:
              'API Auth Token for authorization (defaults to AIRTIFACT_AUTH_TOKEN environment variable).',
            required: false,
          },
        },
      },
    ],
    connect: {
      claudeCode: 'claude mcp add airtifact -- npx -y @airtifact/mcp',
      config: {
        mcpServers: {
          airtifact: {
            command: 'npx',
            args: ['-y', '@airtifact/mcp'],
            env: {
              AIRTIFACT_URL: origin,
              AIRTIFACT_AUTH_TOKEN: '<YOUR_API_AUTH_TOKEN>',
            },
          },
        },
      },
    },
    docs: {
      skill: `${origin}/skill.md`,
      howToDeploy: `${origin}/#snippets`,
      restApi: `${origin}/api/upload`,
      dashboard: `${origin}/dashboard`,
      repo: 'https://github.com/yhauxell/airtifact',
    },
  };

  return NextResponse.json(mcpManifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
