import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define the read_file tool
const tools: Anthropic.Tool[] = [
  {
    name: 'read_file',
    description:
      'Read the complete contents of a file from the file system. ' +
      'Handles various text file formats. Returns the full file content as a string. ' +
      'Use this when you need to examine the contents of a single file.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description:
            'The path to the file to read (relative to the project root)',
        },
      },
      required: ['file_path'],
    },
  },
];

// Execute tool function
function executeTool(toolName: string, toolInput: any): string {
  if (toolName === 'read_file') {
    try {
      const filePath = path.resolve(toolInput.file_path);
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (error: any) {
      return `Error reading file: ${error.message}`;
    }
  }

  return `Unknown tool: ${toolName}`;
}

// Main agent orchestration loop
async function runAgent(userMessage: string): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log(`User: ${userMessage}`);
  console.log('='.repeat(60) + '\n');

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  let response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    tools: tools,
    messages: messages,
  });

  // Agent loop: continue until we get a text response (not a tool use)
  while (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(
      (block) => block.type === 'tool_use'
    ) as Anthropic.ToolUseBlock;

    if (!toolUse) break;

    const toolName = toolUse.name;
    const toolInput = toolUse.input;

    console.log(`🔧 Agent using tool: ${toolName}`);
    console.log(`   Input: ${JSON.stringify(toolInput, null, 2)}\n`);

    // Execute the tool
    const toolResult = executeTool(toolName, toolInput);

    // Add assistant response and tool result to messages
    messages.push({ role: 'assistant', content: response.content });
    messages.push({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: toolResult,
        },
      ],
    });

    // Get next response from Claude
    response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      tools: tools,
      messages: messages,
    });
  }

  // Extract final text response
  const finalResponse = response.content.find(
    (block) => block.type === 'text'
  ) as Anthropic.TextBlock;

  if (finalResponse) {
    console.log(`✅ Agent: ${finalResponse.text}\n`);
  }
}

// Example usage
async function main() {
  try {
    // Example 1: Read a file and analyze it
    await runAgent(
      'Read the package.json file and tell me what dependencies I have installed'
    );

    // Example 2: Try another question
    // await runAgent('Read the tsconfig.json file and explain what it does');

    // Example 3: Read a non-existent file (error handling)
    // await runAgent('Read the missing.txt file');
  } catch (error) {
    console.error('Error running agent:', error);
  }
}

main();
