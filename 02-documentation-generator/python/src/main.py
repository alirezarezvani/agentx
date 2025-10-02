import anthropic
import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

tools = [
    {
        "name": "list_files",
        "description": "List all files in a directory. Returns file paths relative to the project root. Use this to discover what files exist before reading them.",
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
    },
    {
        "name": "read_file",
        "description": "Read the contents of a file from the filesystem. Use this after listing files to examine their contents.",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "The path to the file to read",
                }
            },
            "required": ["file_path"],
        },
    },
    {
        "name": "write_file",
        "description": "Write content to a file. Use this to save generated documentation. Creates the file if it does not exist, overwrites if it does.",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "The path where the file should be written",
                },
                "content": {
                    "type": "string",
                    "description": "The content to write to the file",
                }
            },
            "required": ["file_path", "content"],
        },
    },
]

def execute_tool(tool_name: str, tool_input: dict) -> str:
    if tool_name == "list_files":
        try:
            dir_path = Path(tool_input["directory"]).resolve()
            files = []

            for file_path in dir_path.rglob("*"):
                if file_path.is_file():
                    # Filter for relevant files
                    if file_path.suffix in ['.py', '.js', '.ts', '.tsx', '.jsx']:
                        # Skip test files
                        if 'test' in file_path.name or 'spec' in file_path.name:
                            continue
                        # Skip config files
                        if 'config' in file_path.name:
                            continue

                        relative_path = file_path.relative_to(Path.cwd())
                        files.append(str(relative_path))

            return json.dumps(files, indent=2)
        except Exception as e:
            return f"Error listing files: {str(e)}"

    if tool_name == "read_file":
        try:
            file_path = Path(tool_input["file_path"]).resolve()
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"

    if tool_name == "write_file":
        try:
            file_path = Path(tool_input["file_path"]).resolve()

            # Create directory if it doesn't exist
            file_path.parent.mkdir(parents=True, exist_ok=True)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(tool_input["content"])

            char_count = len(tool_input["content"])
            return f"Successfully wrote {char_count} characters to {tool_input['file_path']}"
        except Exception as e:
            return f"Error writing file: {str(e)}"

    return "Unknown tool"

def run_agent(user_message: str):
    print(f"\n{'=' * 60}")
    print(f"User: {user_message}")
    print('=' * 60)

    messages = [{"role": "user", "content": user_message}]

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8192,
        tools=tools,
        messages=messages,
    )

    iterations = 0
    max_iterations = 20

    while response.stop_reason == "tool_use" and iterations < max_iterations:
        iterations += 1

        tool_use = next((block for block in response.content if block.type == "tool_use"), None)

        if not tool_use:
            break

        print(f"\n🔧 Agent using tool: {tool_use.name}")
        print(f"   Input: {tool_use.input}")

        tool_result = execute_tool(tool_use.name, tool_use.input)

        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": tool_result,
                }
            ],
        })

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8192,
            tools=tools,
            messages=messages,
        )

    final_text = next((block.text for block in response.content if hasattr(block, "text")), None)
    print(f"\n✅ Agent: {final_text}\n")
    print(f"Total tool calls: {iterations}")

if __name__ == "__main__":
    run_agent("Generate documentation for the src directory. Read the Python files, analyze their structure, and create a comprehensive README.md that includes an overview, main components, and usage examples.")
