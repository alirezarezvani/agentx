# TypeScript Implementation - First Agent

Your first autonomous agent that reads files and answers questions.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Run the agent
npm start
```

## 📖 What This Does

The agent will:
1. Read your question about a file
2. Decide to use the `read_file` tool
3. Execute the tool
4. Analyze the contents
5. Give you an answer

## 🧪 Example Output

```
============================================================
User: Read the package.json file and tell me what dependencies I have installed
============================================================

🔧 Agent using tool: read_file
   Input: {
     "file_path": "package.json"
   }

✅ Agent: You have the following dependencies installed:

**Dependencies:**
- @anthropic-ai/sdk (for building agents)
- dotenv (environment variable management)

**Dev Dependencies:**
- typescript (TypeScript compiler)
- @types/node (Node.js type definitions)
- tsx (TypeScript executor)

Your project is set up for building AI agents with TypeScript.
```

## 🎯 Exercises

Try modifying the code to:

### Exercise 1: Add a List Files Tool

Add a tool that lists files in a directory:

```typescript
{
  name: 'list_files',
  description: 'List all files in a directory',
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
}
```

Then implement it:

```typescript
if (toolName === 'list_files') {
  try {
    const dirPath = path.resolve(toolInput.directory);
    const files = fs.readdirSync(dirPath);
    return JSON.stringify(files, null, 2);
  } catch (error: any) {
    return `Error listing files: ${error.message}`;
  }
}
```

Test: `runAgent('List all files in the src directory and describe what you see')`

### Exercise 2: Read Multiple Files

Ask: `"Read both package.json and tsconfig.json, then explain how they work together"`

The agent will use the tool twice before answering.

### Exercise 3: Creative Responses

Try different question styles:
- `"Read package.json and summarize it as a haiku"`
- `"Read package.json and explain it to a beginner"`
- `"Read package.json and suggest improvements"`

### Exercise 4: Error Handling

Ask it to read a file that doesn't exist:
- `"Read the nonexistent.txt file"`

Watch how it handles the error gracefully.

## 🐛 Troubleshooting

### Error: Cannot find module '@anthropic-ai/sdk'

```bash
npm install
```

### Error: ANTHROPIC_API_KEY not found

Make sure `.env` exists in the project root with:
```
ANTHROPIC_API_KEY=your_actual_key
```

### Error: File not found (ENOENT)

Use paths relative to project root:
- ✅ `package.json`
- ✅ `src/index.ts`
- ❌ `/package.json`

### TypeScript Errors

Make sure you're using Node 18+:
```bash
node --version  # Should be v18.0.0 or higher
```

## 📚 Next Steps

1. Complete all exercises above
2. Experiment with different tools
3. Read **Article 2: Documentation Generator**
4. Check out the [Python implementation](../python/) for comparison

## 🔗 Resources

- [Claude Agent SDK Docs](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [Anthropic API Reference](https://docs.anthropic.com/en/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
