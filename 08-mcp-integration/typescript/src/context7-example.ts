import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * CONTEXT7 MCP SERVER INTEGRATION
 *
 * Context7 is an MCP server that provides enhanced context management
 * for AI agents, enabling them to maintain and retrieve conversation
 * context, store important information, and build long-term memory.
 *
 * Capabilities:
 * - Store conversation context across sessions
 * - Retrieve relevant past interactions
 * - Maintain user preferences and history
 * - Build knowledge graphs from conversations
 * - Semantic search over stored context
 *
 * Use cases:
 * - Multi-session conversations
 * - Personalized AI assistants
 * - Long-running agent tasks
 * - Context-aware recommendations
 * - Learning from past interactions
 */

class Context7MCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: Anthropic.Tool[] = [];

  async connect(): Promise<void> {
    console.log('\n🧠 Connecting to Context7 MCP Server...\n');

    // Launch context7 MCP server via npx
    // Context7 manages conversation context and memory
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@context7/mcp-server@latest'],
    });

    this.client = new Client(
      {
        name: 'claude-context7-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);

    const toolsList = await this.client.listTools();

    console.log('✅ Context7 MCP Server Connected!\n');
    console.log('Available context management tools:');
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
      throw new Error('Context7 MCP client not connected');
    }

    console.log(`🔧 Executing context tool: ${toolName}`);
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
      console.log('\n🔌 Disconnected from Context7 MCP Server\n');
    }
  }
}

async function runContext7Agent(
  userMessage: string,
  context7Client: Context7MCPClient
): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log(`User Task: ${userMessage}`);
  console.log('='.repeat(70) + '\n');

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  const tools = context7Client.getTools();

  let response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    tools: tools,
    messages: messages,
  });

  let iterations = 0;
  const maxIterations = 20;

  while (response.stop_reason === 'tool_use' && iterations < maxIterations) {
    iterations++;

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUseBlock of toolUseBlocks) {
      const toolResult = await context7Client.executeTool(
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

  console.log(`📊 Context operations performed: ${iterations}\n`);
}

/**
 * Example tasks demonstrating Context7 MCP capabilities
 */
async function main() {
  const context7Client = new Context7MCPClient();

  try {
    await context7Client.connect();

    console.log('\n' + '█'.repeat(70));
    console.log('  CONTEXT7 MCP INTEGRATION EXAMPLES');
    console.log('  Enhanced Memory and Context Management for AI Agents');
    console.log('█'.repeat(70) + '\n');

    // Example 1: Store user preferences
    console.log('📝 Example 1: Storing User Preferences\n');
    await runContext7Agent(
      'Store my preferences: I prefer TypeScript over JavaScript, I work on AI agents, and my favorite framework is Next.js. Confirm what you stored.',
      context7Client
    );

    // Example 2: Retrieve stored context
    console.log('\n📝 Example 2: Retrieving Stored Context\n');
    await runContext7Agent(
      'What programming language preferences did I mention earlier? And what framework do I like?',
      context7Client
    );

    // Example 3: Build knowledge from conversation
    console.log('\n📝 Example 3: Building Contextual Knowledge\n');
    await runContext7Agent(
      'Based on our previous conversation, suggest 3 article topics that would interest me. Use the context you have stored about my preferences.',
      context7Client
    );

    // Example 4: Multi-turn contextual task
    console.log('\n📝 Example 4: Context-Aware Task Planning\n');
    await runContext7Agent(
      'I want to build a new project. Given what you know about my preferences from earlier, recommend a tech stack and explain why it matches my preferences.',
      context7Client
    );

    console.log('\n✅ All Context7 examples completed!\n');
    console.log('💡 KEY BENEFITS OF CONTEXT7:');
    console.log('   - Persistent memory across conversation sessions');
    console.log('   - Semantic search over stored information');
    console.log('   - Build user profiles and preferences');
    console.log('   - Enable truly personalized AI interactions');
    console.log('   - Maintain long-term context for complex tasks\n');

  } catch (error) {
    console.error('❌ Error running Context7 example:', error);
  } finally {
    await context7Client.disconnect();
  }
}

main();
