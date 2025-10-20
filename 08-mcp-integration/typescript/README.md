# MCP Server Integration - TypeScript Implementation

This implementation demonstrates how to connect Claude agents to external tools using the Model Context Protocol (MCP), with working examples for browser automation, context management, and documentation lookup.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run the main overview
npm start

# Run specific examples
npm run chrome     # Chrome DevTools browser automation
npm run context7   # Context7 memory management
npm run ref        # Reference documentation lookup
```

## 📁 Project Structure

```
src/
├── index.ts                    # MCP overview and architecture explanation
├── chrome-devtools-example.ts  # Browser automation with chrome-devtools-mcp
├── context7-example.ts         # Persistent memory with context7
└── ref-example.ts              # Documentation lookup with ref server
```

## 🔧 Available Examples

### 1. Chrome DevTools MCP (`npm run chrome`)

**What it demonstrates:**
- Connecting to chrome-devtools-mcp server
- Browser automation (navigate, click, extract data)
- Web scraping with Claude's intelligence
- Form automation

**Example tasks:**
```typescript
// Navigate and extract data
"Go to https://example.com and extract the main heading"

// Automated search
"Search GitHub trending and list top 3 repositories"

// Form filling
"Fill out the contact form with test data and submit"
```

**Key learning:** How agents can control browsers autonomously

### 2. Context7 MCP (`npm run context7`)

**What it demonstrates:**
- Connecting to context7 MCP server
- Storing and retrieving conversation context
- Building persistent memory
- Multi-turn contextual conversations

**Example tasks:**
```typescript
// Store preferences
"Remember that I prefer TypeScript and Next.js"

// Retrieve context
"What programming languages did I mention earlier?"

// Contextual recommendations
"Based on my preferences, suggest a project tech stack"
```

**Key learning:** How to give agents long-term memory

### 3. Reference MCP (`npm run ref`)

**What it demonstrates:**
- Connecting to ref MCP server
- Looking up real-time documentation
- Accessing API references
- Documentation-informed code generation

**Example tasks:**
```typescript
// API documentation lookup
"Look up React useState hook documentation"

// Framework best practices
"Search Next.js docs for App Router vs Pages Router"

// Code generation with docs
"Look up Anthropic streaming API and write an example"
```

**Key learning:** How to prevent hallucination in code generation

## 🏗️ Code Architecture

### MCP Client Pattern

All examples follow this pattern:

```typescript
// 1. Create MCP client
class MCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  // 2. Connect to MCP server via stdio
  async connect() {
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mcp-server-package@latest']
    });

    await this.client.connect(this.transport);

    // 3. Discover available tools
    const tools = await this.client.listTools();
  }

  // 4. Execute tools
  async executeTool(name: string, input: any) {
    return await this.client.callTool({ name, arguments: input });
  }
}

// 5. Forward tools to Claude
const tools = mcpClient.getTools();
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  tools: tools,  // MCP tools
  messages: messages
});

// 6. Agent loop: Claude → MCP → Results → Claude
while (response.stop_reason === 'tool_use') {
  // Execute tools via MCP
  const results = await mcpClient.executeTool(...);

  // Feed results back to Claude
  messages.push({ role: 'user', content: results });
  response = await anthropic.messages.create(...);
}
```

### Key Components

1. **StdioClientTransport**: Communicates with MCP server processes via stdin/stdout
2. **MCP Client**: Manages connection, tool discovery, and execution
3. **Tool Forwarding**: Converts MCP tools to Anthropic's format
4. **Agent Loop**: Claude decides → MCP executes → Results feed back

## 🔌 How MCP Servers Work

MCP servers are **separate Node.js processes** that:

1. **Expose tools** via the MCP protocol
2. **Run in isolation** for security
3. **Communicate via stdio** (standard input/output)
4. **Can be installed** via npm/npx

```bash
# MCP servers are typically run via npx
npx -y chrome-devtools-mcp@latest

# They expose tools that your agent can use
# Your code connects to them via stdio transport
```

## 📦 Dependencies

### Core Dependencies

- **@anthropic-ai/sdk**: Claude API client
- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **dotenv**: Environment variable management

### MCP Servers (installed automatically via npx)

- **chrome-devtools-mcp**: Browser automation
- **@context7/mcp-server**: Context management
- **@modelcontextprotocol/server-ref**: Documentation lookup

## 🧪 Customizing Examples

### Modify Prompts

Edit the `main()` function in any example:

```typescript
// chrome-devtools-example.ts
await runChromeAgent(
  'Your custom browser automation task here',
  chromeClient
);
```

### Add More Tasks

```typescript
// Add new example to main()
console.log('\n📝 Example 5: Custom Task\n');
await runChromeAgent(
  'Navigate to my company website and check if all links work',
  chromeClient
);
```

### Adjust Iteration Limits

```typescript
// Increase for complex tasks
const maxIterations = 50;  // Default: 20-30
```

### Change Claude Model

```typescript
// Use different Claude models
model: 'claude-3-5-sonnet-20241022',  // Faster
model: 'claude-sonnet-4-20250514',    // More capable (default)
```

## 🐛 Troubleshooting

### Error: "Command not found: npx"

**Solution:** Install Node.js 18+ which includes npx

```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Install from https://nodejs.org if needed
```

### Error: "ANTHROPIC_API_KEY not found"

**Solution:** Set up your .env file

```bash
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=your_key_here
```

### Error: "MCP server connection timeout"

**Solutions:**
1. Check internet connection (npx downloads packages)
2. Try running the MCP server manually:
   ```bash
   npx -y chrome-devtools-mcp@latest
   # Should start without errors
   ```
3. Increase timeout in code

### Error: "Tool execution failed"

**Common causes:**
- Browser automation: Website blocking automated access
- Context7: Storage permissions issue
- Ref: Documentation source temporarily unavailable

**Solution:** Check the tool result error message for specifics

### Performance: Agent is slow

**Optimizations:**
1. Use `claude-3-5-sonnet-20241022` for faster responses
2. Reduce `max_tokens` if you don't need long responses
3. Browser automation is inherently slower (real browser operations)

## 💡 Best Practices

### 1. Error Handling

```typescript
try {
  await mcpClient.connect();
  await runAgent(...);
} catch (error) {
  console.error('MCP error:', error);
} finally {
  await mcpClient.disconnect();  // Always cleanup
}
```

### 2. Resource Cleanup

```typescript
// Always disconnect MCP clients
await chromeClient.disconnect();
```

### 3. Secure API Keys

```typescript
// Never commit .env files
// Add to .gitignore (already included)
// Use environment variables in production
```

### 4. Rate Limiting

```typescript
// Be mindful of API rate limits
// Add delays for high-volume tasks
await new Promise(resolve => setTimeout(resolve, 1000));
```

## 🎓 Learning Path

### Beginner Path
1. Run `npm start` to understand MCP concepts
2. Try `npm run chrome` with the default examples
3. Modify prompts to see how Claude adapts
4. Read through one implementation file completely

### Intermediate Path
1. Run all three examples
2. Modify each to solve a real problem you have
3. Combine multiple MCP servers in one agent
4. Implement error handling improvements

### Advanced Path
1. Build a custom MCP server for your use case
2. Integrate with databases (try postgres-mcp)
3. Create multi-agent systems with different MCP servers
4. Deploy to production with proper monitoring

## 🔗 Additional Resources

### MCP Ecosystem

- **[MCP Servers Registry](https://github.com/modelcontextprotocol/servers)**: Browse 100+ MCP servers
  - File systems (filesystem-mcp)
  - Databases (postgres-mcp, sqlite-mcp)
  - APIs (github-mcp, slack-mcp)
  - Search (google-search-mcp)
  - And many more!

### Building MCP Servers

- **[MCP SDK Docs](https://modelcontextprotocol.io/docs/sdk)**: Build your own servers
- **[TypeScript Examples](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/examples)**: Reference implementations

### Claude + MCP

- **[Anthropic MCP Guide](https://docs.anthropic.com/claude/docs/mcp)**: Official integration guide
- **[Computer Use + MCP](https://docs.anthropic.com/claude/docs/computer-use)**: Advanced patterns

## 🚀 Next Steps

1. **Experiment** with different prompts in each example
2. **Combine servers**: Use chrome + ref together for doc-informed scraping
3. **Build something real**: Solve an actual problem you have
4. **Explore more servers**: Check the MCP registry for others
5. **Create custom server**: Build an MCP server for your domain
6. **Production deploy**: Move to Article 7 for deployment patterns

---

*Need help? Open an issue or check the main README for general troubleshooting.*
