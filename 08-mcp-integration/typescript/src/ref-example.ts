import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * REF MCP SERVER INTEGRATION
 *
 * The Ref MCP server provides AI agents with the ability to search
 * and retrieve technical documentation, API references, and framework
 * guides in real-time.
 *
 * Capabilities:
 * - Search official documentation (React, TypeScript, Python, etc.)
 * - Retrieve API reference information
 * - Look up framework-specific guides
 * - Access up-to-date library documentation
 * - Find code examples and best practices
 *
 * Use cases:
 * - Code generation with accurate API usage
 * - Learning new frameworks/libraries
 * - Debugging with official documentation
 * - Staying current with latest API changes
 * - Building educational tools
 */

class RefMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: Anthropic.Tool[] = [];

  async connect(): Promise<void> {
    console.log('\n📚 Connecting to Ref MCP Server...\n');

    // Launch ref MCP server via npx
    // Ref provides access to technical documentation and references
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-ref@latest'],
    });

    this.client = new Client(
      {
        name: 'claude-ref-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);

    const toolsList = await this.client.listTools();

    console.log('✅ Ref MCP Server Connected!\n');
    console.log('Available documentation lookup tools:');
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
      throw new Error('Ref MCP client not connected');
    }

    console.log(`🔧 Executing reference lookup: ${toolName}`);
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
      console.log('\n🔌 Disconnected from Ref MCP Server\n');
    }
  }
}

async function runRefAgent(
  userMessage: string,
  refClient: RefMCPClient
): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log(`User Task: ${userMessage}`);
  console.log('='.repeat(70) + '\n');

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  const tools = refClient.getTools();

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
      const toolResult = await refClient.executeTool(
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

  console.log(`📊 Documentation lookups performed: ${iterations}\n`);
}

/**
 * Example tasks demonstrating Ref MCP capabilities
 */
async function main() {
  const refClient = new RefMCPClient();

  try {
    await refClient.connect();

    console.log('\n' + '█'.repeat(70));
    console.log('  REF MCP INTEGRATION EXAMPLES');
    console.log('  Real-time Documentation and API Reference Lookup');
    console.log('█'.repeat(70) + '\n');

    // Example 1: Look up API documentation
    console.log('📝 Example 1: API Documentation Lookup\n');
    await runRefAgent(
      'Look up the official documentation for React useState hook. Explain how to use it with TypeScript and provide a code example.',
      refClient
    );

    // Example 2: Framework best practices
    console.log('\n📝 Example 2: Framework Best Practices\n');
    await runRefAgent(
      'Search for Next.js App Router documentation and explain the difference between server components and client components. Include when to use each.',
      refClient
    );

    // Example 3: Code generation with documentation
    console.log('\n📝 Example 3: Documentation-Informed Code Generation\n');
    await runRefAgent(
      'Look up the Anthropic Claude API documentation for streaming responses. Then write a TypeScript example showing how to implement streaming with proper error handling.',
      refClient
    );

    // Example 4: Learning new APIs
    console.log('\n📝 Example 4: Learning New APIs\n');
    await runRefAgent(
      'I want to use the Fetch API to make POST requests with JSON. Look up the documentation and show me the correct syntax with headers and error handling.',
      refClient
    );

    console.log('\n✅ All Ref MCP examples completed!\n');
    console.log('💡 KEY BENEFITS OF REF MCP:');
    console.log('   - Always-current documentation access');
    console.log('   - Accurate API usage examples');
    console.log('   - Reduced hallucination in code generation');
    console.log('   - Learn new frameworks faster');
    console.log('   - Stay updated with breaking changes\n');

    console.log('🔧 SUPPORTED DOCUMENTATION SOURCES:');
    console.log('   - React, Vue, Angular, Svelte');
    console.log('   - TypeScript, JavaScript, Python');
    console.log('   - Next.js, Nuxt, SvelteKit');
    console.log('   - Node.js, Deno, Bun');
    console.log('   - And many more popular frameworks!\n');

  } catch (error) {
    console.error('❌ Error running Ref example:', error);
  } finally {
    await refClient.disconnect();
  }
}

main();
