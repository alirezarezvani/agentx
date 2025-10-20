# MCP Server Integration - Python Implementation

This implementation demonstrates how to connect Claude agents to external tools using the Model Context Protocol (MCP) in Python, with conceptual examples for browser automation, context management, and documentation lookup.

## 🚀 Quick Start

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run the main demonstration
python main.py

# Run specific examples (when implemented)
python chrome_devtools_example.py
python context7_example.py
python ref_example.py
```

## 📁 Project Structure

```
├── main.py                      # MCP overview and architecture explanation
├── chrome_devtools_example.py   # Browser automation example (conceptual)
├── context7_example.py          # Context management example (conceptual)
├── ref_example.py               # Documentation lookup example (conceptual)
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🔧 Understanding MCP in Python

### MCP Architecture

```python
from mcp import StdioServerParameters, stdio_client
from anthropic import Anthropic

# 1. Create MCP client with stdio transport
server_params = StdioServerParameters(
    command="npx",
    args=["-y", "chrome-devtools-mcp@latest"]
)

# 2. Connect to MCP server
async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # 3. Initialize and discover tools
        await session.initialize()
        tools_list = await session.list_tools()

        # 4. Forward tools to Claude
        client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

        # 5. Agent loop
        while stop_reason == "tool_use":
            # Execute tools via MCP
            result = await session.call_tool(tool_name, arguments)

            # Feed results back to Claude
            response = client.messages.create(...)
```

### Key Components

1. **StdioServerParameters**: Configuration for MCP server process
2. **stdio_client**: Context manager for stdio transport
3. **ClientSession**: MCP client session management
4. **Tool Discovery**: List and describe available tools
5. **Tool Execution**: Call MCP tools and get results

## 📦 Dependencies

### Core Dependencies

```txt
anthropic>=0.40.0        # Claude API client
python-dotenv>=1.0.0     # Environment variables
mcp>=1.0.0               # MCP protocol client
```

### MCP Servers (installed automatically via npx)

The MCP servers run as Node.js processes, so you need:
- Node.js 18+ installed
- npx available (comes with Node.js)

MCP servers used:
- **chrome-devtools-mcp**: Browser automation
- **@context7/mcp-server**: Context management
- **@modelcontextprotocol/server-ref**: Documentation lookup

## 🏗️ Implementation Pattern

### Complete MCP Agent Example

```python
import asyncio
import os
from anthropic import Anthropic
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

load_dotenv()

async def run_mcp_agent(user_message: str, server_command: str, server_args: list):
    """
    Run a Claude agent with MCP server integration

    Args:
        user_message: The task for the agent
        server_command: Command to start MCP server (e.g., "npx")
        server_args: Arguments for the server command
    """
    # Initialize Anthropic client
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    # Configure MCP server
    server_params = StdioServerParameters(
        command=server_command,
        args=server_args
    )

    # Connect to MCP server
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize MCP session
            await session.initialize()

            # Discover available tools
            tools_list = await session.list_tools()

            # Convert MCP tools to Anthropic format
            tools = [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "input_schema": tool.inputSchema
                }
                for tool in tools_list.tools
            ]

            # Initialize conversation
            messages = [{"role": "user", "content": user_message}]

            # Agent loop
            max_iterations = 20
            iterations = 0

            while iterations < max_iterations:
                # Get Claude's response
                response = client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4096,
                    tools=tools,
                    messages=messages
                )

                # Check if Claude wants to use tools
                if response.stop_reason != "tool_use":
                    break

                iterations += 1

                # Process tool use blocks
                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        # Execute tool via MCP
                        result = await session.call_tool(
                            block.name,
                            arguments=block.input
                        )

                        # Collect result
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": str(result.content)
                        })

                # Add assistant response and tool results to conversation
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})

            # Extract final response
            final_text = next(
                (block.text for block in response.content if block.type == "text"),
                None
            )

            print(f"Agent: {final_text}")
            print(f"Tool calls made: {iterations}")

# Example usage
asyncio.run(run_mcp_agent(
    "Navigate to example.com and extract the heading",
    "npx",
    ["-y", "chrome-devtools-mcp@latest"]
))
```

## 🔌 MCP Server Integration Examples

### 1. Chrome DevTools (Browser Automation)

```python
server_params = StdioServerParameters(
    command="npx",
    args=["-y", "chrome-devtools-mcp@latest"]
)

# Agent can now:
# - Navigate websites
# - Click elements
# - Fill forms
# - Extract data
# - Take screenshots
```

### 2. Context7 (Memory Management)

```python
server_params = StdioServerParameters(
    command="npx",
    args=["-y", "@context7/mcp-server@latest"]
)

# Agent can now:
# - Store conversation context
# - Retrieve past interactions
# - Maintain user preferences
# - Build knowledge over time
```

### 3. Ref (Documentation Lookup)

```python
server_params = StdioServerParameters(
    command="npx",
    args=["-y", "@modelcontextprotocol/server-ref@latest"]
)

# Agent can now:
# - Search official documentation
# - Look up API references
# - Get current code examples
# - Access framework guides
```

## 🐛 Troubleshooting

### Error: "Command not found: npx"

**Solution:** Install Node.js 18+ which includes npx

```bash
# Check if Node.js is installed
node --version

# Download from https://nodejs.org if needed
```

### Error: "ANTHROPIC_API_KEY not found"

**Solution:** Set up your .env file

```bash
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=your_actual_key_here
```

### Error: "ModuleNotFoundError: No module named 'mcp'"

**Solution:** Install dependencies in virtual environment

```bash
# Activate virtual environment first
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Then install
pip install -r requirements.txt
```

### Error: "MCP connection timeout"

**Solutions:**
1. Check internet connection (npx downloads packages)
2. Verify Node.js is installed and accessible
3. Try running MCP server manually:
   ```bash
   npx -y chrome-devtools-mcp@latest
   ```

## 💡 Best Practices

### 1. Use Async/Await

```python
# MCP clients are async
async def main():
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            # Your MCP code here
            pass

asyncio.run(main())
```

### 2. Proper Resource Cleanup

```python
# Use context managers for automatic cleanup
async with ClientSession(read, write) as session:
    # Session automatically closed when done
    pass
```

### 3. Error Handling

```python
try:
    result = await session.call_tool(name, args)
except Exception as e:
    print(f"Tool execution failed: {e}")
    # Handle error appropriately
```

### 4. Environment Variables

```python
# Use python-dotenv for configuration
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY not set")
```

## 🎓 Learning Path

### Beginner
1. Run `python main.py` to understand concepts
2. Read through the implementation pattern above
3. Study the async/await MCP client pattern
4. Modify prompts to see how Claude adapts

### Intermediate
1. Implement one complete example (e.g., chrome_devtools_example.py)
2. Add error handling and logging
3. Combine multiple MCP servers in one script
4. Build a useful automation tool

### Advanced
1. Create custom MCP server in Python
2. Integrate with databases and APIs
3. Build multi-agent systems
4. Deploy to production with proper monitoring

## 🔗 Additional Resources

### MCP Python Resources

- **[MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)**: Official Python SDK
- **[Python Examples](https://github.com/modelcontextprotocol/python-sdk/tree/main/examples)**: Reference implementations
- **[MCP Documentation](https://modelcontextprotocol.io/)**: Complete protocol docs

### Available MCP Servers

- **[MCP Servers Registry](https://github.com/modelcontextprotocol/servers)**: 100+ servers
  - filesystem-mcp (file operations)
  - postgres-mcp (PostgreSQL)
  - github-mcp (GitHub API)
  - slack-mcp (Slack integration)
  - And many more!

### Building MCP Servers

- **[Build MCP Servers](https://modelcontextprotocol.io/docs/build)**: Create your own
- **[Python Server Tutorial](https://modelcontextprotocol.io/docs/build/python)**: Step-by-step guide

## 🚀 Next Steps

1. **Implement examples**: Complete the chrome_devtools_example.py
2. **Experiment**: Try different MCP servers from the registry
3. **Build something useful**: Solve a real problem
4. **Create custom server**: Build an MCP server for your domain
5. **Production deployment**: See Article 7 for deployment patterns

## 📝 Notes

### TypeScript vs Python

- **TypeScript implementation**: More complete, production-ready examples
- **Python implementation**: Conceptual, focuses on MCP patterns
- **Recommendation**: Check TypeScript examples for working code, adapt to Python

### MCP Server Compatibility

- Most MCP servers are written in Node.js/TypeScript
- They work with Python clients via stdio protocol
- No language barrier - protocol is language-agnostic

---

*Need help? Check the TypeScript implementation for working examples or open an issue.*
