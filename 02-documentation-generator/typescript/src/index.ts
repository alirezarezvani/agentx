import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tools: Anthropic.Tool[] = [
  {
    name: 'list_files',
    description: 'List all files in a directory. Returns file paths relative to the project root. Use this to discover what files exist before reading them.',
    input_schema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The directory path to list files from',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file from the filesystem. Use this after listing files to examine their contents.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path to the file to read',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file. Use this to save generated documentation. Creates the file if it does not exist, overwrites if it does.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path where the file should be written',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file',
        },
      },
      required: ['file_path', 'content'],
    },
  },
];

function executeTool(toolName: string, toolInput: any): string {
  if (toolName === 'list_files') {
    try {
      const dirPath = path.resolve(toolInput.directory);
      const files = fs.readdirSync(dirPath, { recursive: true });

      // Filter for relevant files (TypeScript, JavaScript)
      const relevantFiles = files
        .filter((file: any) => {
          const fileName = file.toString();
          const ext = path.extname(fileName);

          // Include only source files
          if (!['.ts', '.js', '.tsx', '.jsx'].includes(ext)) return false;

          // Skip test files
          if (fileName.includes('.test.') || fileName.includes('.spec.')) return false;

          // Skip config files
          if (fileName.includes('config')) return false;

          return true;
        })
        .map((file: any) => path.join(toolInput.directory, file.toString()));

      return JSON.stringify(relevantFiles, null, 2);
    } catch (error: any) {
      return `Error listing files: ${error.message}`;
    }
  }

  if (toolName === 'read_file') {
    try {
      const filePath = path.resolve(toolInput.file_path);
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (error: any) {
      return `Error reading file: ${error.message}`;
    }
  }

  if (toolName === 'write_file') {
    try {
      const filePath = path.resolve(toolInput.file_path);
      const dir = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, toolInput.content, 'utf-8');
      return `Successfully wrote ${toolInput.content.length} characters to ${toolInput.file_path}`;
    } catch (error: any) {
      return `Error writing file: ${error.message}`;
    }
  }

  return 'Unknown tool';
}

async function runAgent(userMessage: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`User: ${userMessage}`);
  console.log('='.repeat(60));

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  let response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    tools: tools,
    messages: messages,
  });

  let iterations = 0;
  const maxIterations = 20;

  while (response.stop_reason === 'tool_use' && iterations < maxIterations) {
    iterations++;

    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (!toolUseBlock) break;

    console.log(`\n🔧 Agent using tool: ${toolUseBlock.name}`);
    console.log(`   Input: ${JSON.stringify(toolUseBlock.input, null, 2)}`);

    const toolResult = executeTool(toolUseBlock.name, toolUseBlock.input);

    messages.push({ role: 'assistant', content: response.content });
    messages.push({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: toolResult,
        },
      ],
    });

    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      tools: tools,
      messages: messages,
    });
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  console.log(`\n✅ Agent: ${textBlock?.text}\n`);
  console.log(`Total tool calls: ${iterations}`);
}

// Test it
runAgent('Generate documentation for the src directory. Read the TypeScript files, analyze their structure, and create a comprehensive README.md that includes an overview, main components, and usage examples.');
