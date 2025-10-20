import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Anthropic client
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * MCP Server Configuration
 * Each MCP server runs as a separate process and communicates via stdio
 */
interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  description: string;
}

/**
 * Base MCP Client Manager
 * Handles connection to MCP servers and tool forwarding to Claude
 */
class MCPClientManager {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: Anthropic.Tool[] = [];

  async connect(config: MCPServerConfig): Promise<void> {
    console.log(`\n🔌 Connecting to MCP server: ${config.name}...`);
    console.log(`   Command: ${config.command} ${config.args.join(' ')}\n`);

    // Create stdio transport to communicate with MCP server process
    this.transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
    });

    // Initialize MCP client
    this.client = new Client(
      {
        name: 'claude-agent-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Connect to the server
    await this.client.connect(this.transport);

    // List available tools from the MCP server
    const toolsList = await this.client.listTools();

    console.log(`✅ Connected! Available tools from ${config.name}:`);
    toolsList.tools.forEach((tool) => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log('');

    // Convert MCP tools to Anthropic tool format
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
      throw new Error('MCP client not connected');
    }

    console.log(`🔧 Executing MCP tool: ${toolName}`);
    console.log(`   Input: ${JSON.stringify(toolInput, null, 2)}\n`);

    try {
      // Call the tool on the MCP server
      const result = await this.client.callTool({
        name: toolName,
        arguments: toolInput,
      });

      // MCP servers return results in a specific format
      // Extract the actual content
      if (result.content && Array.isArray(result.content)) {
        const textContent = result.content
          .filter((item: any) => item.type === 'text')
          .map((item: any) => item.text)
          .join('\n');

        return textContent || JSON.stringify(result.content);
      }

      return JSON.stringify(result);
    } catch (error: any) {
      return `Error executing tool: ${error.message}`;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MCP server\n');
    }
  }
}

/**
 * Agent orchestration loop with MCP integration
 * This is the core pattern: Claude decides which tools to use,
 * we execute them via MCP, and feed results back to Claude
 */
async function runAgentWithMCP(
  userMessage: string,
  mcpManager: MCPClientManager
): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log(`User: ${userMessage}`);
  console.log('='.repeat(70) + '\n');

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  // Get tools from connected MCP server
  const tools = mcpManager.getTools();

  let response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools: tools,
    messages: messages,
  });

  let iterations = 0;
  const maxIterations = 25;

  // Agent loop: continue until Claude stops requesting tools
  while (response.stop_reason === 'tool_use' && iterations < maxIterations) {
    iterations++;

    // Get all tool use blocks from Claude's response
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) break;

    // Execute all tools via MCP and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUseBlock of toolUseBlocks) {
      const toolResult = await mcpManager.executeTool(
        toolUseBlock.name,
        toolUseBlock.input
      );

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUseBlock.id,
        content: toolResult,
      });
    }

    // Send tool results back to Claude
    messages.push({ role: 'assistant', content: response.content });
    messages.push({
      role: 'user',
      content: toolResults,
    });

    // Get Claude's next response
    response = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: tools,
      messages: messages,
    });
  }

  // Extract and display final response
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  if (textBlock) {
    console.log(`✅ Agent Response:\n${textBlock.text}\n`);
  }

  console.log(`📊 Total MCP tool calls: ${iterations}\n`);
}

/**
 * Example: Demonstrate MCP integration basics
 * This shows the general pattern that applies to any MCP server
 */
async function demonstrateMCPIntegration() {
  console.log('\n' + '█'.repeat(70));
  console.log('  MCP INTEGRATION DEMONSTRATION');
  console.log('  Connecting Claude Agents to External Tools via MCP');
  console.log('█'.repeat(70));

  // Note: This is a conceptual example
  // In practice, you'd install an MCP server via npx or globally
  // Example: npx -y chrome-devtools-mcp@latest

  console.log(`
📚 WHAT IS MCP (Model Context Protocol)?

MCP is a standardized protocol that allows AI agents to:
  ✓ Connect to external tools and data sources
  ✓ Use browser automation, databases, APIs, and more
  ✓ Extend capabilities beyond built-in tools
  ✓ Maintain secure, sandboxed tool execution

🏗️  HOW IT WORKS:

  1. MCP Server Process: Runs as separate Node.js process
     └─> Exposes tools via stdin/stdout (stdio transport)

  2. MCP Client (this code): Connects to server process
     └─> Discovers available tools
     └─> Forwards tool requests from Claude

  3. Claude Agent: Makes autonomous decisions
     └─> Chooses which tools to use
     └─> Processes tool results
     └─> Completes user's task

🔧 AVAILABLE MCP SERVERS IN THIS TUTORIAL:

  1. chrome-devtools-mcp
     • Browser automation and debugging
     • Navigate pages, click elements, extract data
     • Use case: Web scraping, testing, automation

  2. context7
     • Enhanced context management
     • Store and retrieve conversation context
     • Use case: Multi-turn conversations, memory

  3. ref
     • Reference and documentation lookup
     • Search technical docs, APIs, frameworks
     • Use case: Code generation, learning, debugging

📖 TO RUN SPECIFIC EXAMPLES:

  npm run chrome    # Chrome DevTools automation example
  npm run context7  # Context management example
  npm run ref       # Reference lookup example

💡 NEXT STEPS:

  1. Review the example files in src/
  2. Try running each example
  3. Modify the prompts to test different scenarios
  4. Build your own MCP-powered agents!
`);
}

// Run the demonstration
demonstrateMCPIntegration();
