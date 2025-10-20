import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * CHROME DEVTOOLS MCP SERVER INTEGRATION
 *
 * This example demonstrates how to use chrome-devtools-mcp to give
 * Claude the ability to control a Chrome browser programmatically.
 *
 * Capabilities:
 * - Navigate to URLs
 * - Click elements
 * - Fill forms
 * - Extract page data
 * - Take screenshots
 * - Execute JavaScript
 *
 * Use cases:
 * - Web scraping
 * - Automated testing
 * - Data extraction
 * - Form automation
 * - Browser-based workflows
 */

class ChromeDevToolsMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: Anthropic.Tool[] = [];

  async connect(): Promise<void> {
    console.log('\n🌐 Connecting to Chrome DevTools MCP Server...\n');

    // Launch chrome-devtools-mcp server via npx
    // The @latest tag ensures we get the newest version
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'chrome-devtools-mcp@latest'],
    });

    this.client = new Client(
      {
        name: 'claude-chrome-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);

    const toolsList = await this.client.listTools();

    console.log('✅ Chrome DevTools MCP Server Connected!\n');
    console.log('Available browser automation tools:');
    toolsList.tools.forEach((tool) => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log('');

    // Convert to Anthropic tool format
    this.tools = toolsList.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || '',
      input_schema: tool.inputSchema as any,
    }));
  }

  getTools(): Anthropic.Tool[] {
    return this.tools;
  }

  async executeTool(toolName: string, toolInput: any): Promise<string> {
    if (!this.client) {
      throw new Error('Chrome DevTools MCP client not connected');
    }

    console.log(`🔧 Executing browser tool: ${toolName}`);
    console.log(`   Input: ${JSON.stringify(toolInput, null, 2)}\n`);

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: toolInput,
      });

      if (result.content && Array.isArray(result.content)) {
        const textContent = result.content
          .filter((item: any) => item.type === 'text')
          .map((item: any) => item.text)
          .join('\n');

        return textContent || JSON.stringify(result.content);
      }

      return JSON.stringify(result);
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('\n🔌 Disconnected from Chrome DevTools MCP Server\n');
    }
  }
}

async function runChromeAgent(
  userMessage: string,
  chromeClient: ChromeDevToolsMCPClient
): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log(`User Task: ${userMessage}`);
  console.log('='.repeat(70) + '\n');

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  const tools = chromeClient.getTools();

  let response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools: tools,
    messages: messages,
  });

  let iterations = 0;
  const maxIterations = 30;

  while (response.stop_reason === 'tool_use' && iterations < maxIterations) {
    iterations++;

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUseBlock of toolUseBlocks) {
      const toolResult = await chromeClient.executeTool(
        toolUseBlock.name,
        toolUseBlock.input
      );

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUseBlock.id,
        content: toolResult,
      });
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({
      role: 'user',
      content: toolResults,
    });

    response = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: tools,
      messages: messages,
    });
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (textBlock) {
    console.log(`✅ Agent Result:\n${textBlock.text}\n`);
  }

  console.log(`📊 Browser operations performed: ${iterations}\n`);
}

/**
 * Example tasks demonstrating Chrome DevTools MCP capabilities
 */
async function main() {
  const chromeClient = new ChromeDevToolsMCPClient();

  try {
    await chromeClient.connect();

    console.log('\n' + '█'.repeat(70));
    console.log('  CHROME DEVTOOLS MCP INTEGRATION EXAMPLES');
    console.log('█'.repeat(70) + '\n');

    // Example 1: Navigate and extract data
    console.log('📝 Example 1: Web Scraping with Browser Automation\n');
    await runChromeAgent(
      'Navigate to https://example.com and extract the main heading and first paragraph text',
      chromeClient
    );

    // Example 2: Search and extract results
    console.log('\n📝 Example 2: Automated Search and Data Extraction\n');
    await runChromeAgent(
      'Go to https://github.com/trending and extract the names of the top 3 trending repositories today',
      chromeClient
    );

    // Example 3: Form interaction
    console.log('\n📝 Example 3: Form Automation\n');
    await runChromeAgent(
      'Navigate to https://httpbin.org/forms/post, fill in the form with sample data (name: "Test User", email: "test@example.com"), and submit it. Then tell me what response you received.',
      chromeClient
    );

    console.log('\n✅ All Chrome DevTools examples completed!\n');
    console.log('💡 TIP: You can modify these examples to:');
    console.log('   - Scrape product prices from e-commerce sites');
    console.log('   - Automate repetitive browser tasks');
    console.log('   - Test web applications');
    console.log('   - Extract structured data from websites');
    console.log('   - Monitor web content changes\n');

  } catch (error) {
    console.error('❌ Error running Chrome DevTools example:', error);
  } finally {
    await chromeClient.disconnect();
  }
}

main();
