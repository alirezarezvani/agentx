# Python Implementation - First Agent

Your first autonomous agent that reads files and answers questions.

## 🚀 Quick Start

```bash
# 1. Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 4. Run the agent
python src/main.py
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
User: Read the requirements.txt file and tell me what packages I have
============================================================

🔧 Agent using tool: read_file
   Input: {'file_path': 'requirements.txt'}

✅ Agent: You have 2 packages installed:

1. **anthropic** (v0.40.0) - The Claude SDK for building AI agents
2. **python-dotenv** (v1.0.1) - Environment variable management

These are the core dependencies needed to build agents with Python.
```

## 🎯 Exercises

Try modifying the code to:

### Exercise 1: Add a List Files Tool

Add to the `tools` list:

```python
{
    "name": "list_files",
    "description": "List all files in a directory",
    "input_schema": {
        "type": "object",
        "properties": {
            "directory": {
                "type": "string",
                "description": "The directory path to list files from",
            }
        },
        "required": ["directory"],
    },
}
```

Then implement it in `execute_tool`:

```python
if tool_name == "list_files":
    try:
        dir_path = Path(tool_input["directory"]).resolve()
        files = [f.name for f in dir_path.iterdir()]
        return "\n".join(files)
    except Exception as e:
        return f"Error listing files: {str(e)}"
```

Test: `run_agent("List all files in the src directory and describe what you see")`

### Exercise 2: Read Multiple Files

Ask: `"Read both requirements.txt and .env.example, then explain their relationship"`

The agent will use the tool twice.

### Exercise 3: Creative Responses

Try different styles:
- `"Read requirements.txt and write a limerick about it"`
- `"Read requirements.txt and explain it to a 5-year-old"`
- `"Read requirements.txt and suggest additional packages"`

### Exercise 4: Error Handling

Ask it to read a nonexistent file:
- `"Read the missing.txt file"`

Watch the graceful error handling.

## 🐛 Troubleshooting

### Error: No module named 'anthropic'

```bash
pip install -r requirements.txt
```

Or if you forgot the virtual environment:
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Error: ANTHROPIC_API_KEY not found

Make sure `.env` exists with:
```
ANTHROPIC_API_KEY=your_actual_key
```

### Error: FileNotFoundError

Use paths relative to project root:
- ✅ `requirements.txt`
- ✅ `src/main.py`
- ❌ `/requirements.txt`

### Python Version Issues

This code requires Python 3.9+:
```bash
python --version  # Should be 3.9 or higher
```

## 🔄 Python vs TypeScript

**Key Differences:**

| Feature | TypeScript | Python |
|---------|-----------|--------|
| Type Safety | Compile-time types | Runtime (with hints) |
| Async | async/await | async/await (same!) |
| File I/O | fs module | pathlib + open() |
| Error Handling | try/catch | try/except |

**Similarities:**
- Agent loop logic is identical
- Tool schema format is the same
- SDK patterns are equivalent

## 📚 Next Steps

1. Complete all exercises above
2. Compare with [TypeScript implementation](../typescript/)
3. Add your own tools (write_file, search_files, etc.)
4. Read **Article 2: Documentation Generator**

## 🔗 Resources

- [Claude Agent SDK Docs](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [Anthropic Python SDK](https://github.com/anthropics/anthropic-sdk-python)
- [Python Official Docs](https://docs.python.org/3/)
