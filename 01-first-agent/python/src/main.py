import anthropic
import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the Anthropic client
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Define the read_file tool
tools = [
    {
        "name": "read_file",
        "description": (
            "Read the complete contents of a file from the file system. "
            "Handles various text file formats. Returns the full file content as a string. "
            "Use this when you need to examine the contents of a single file."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "The path to the file to read (relative to the project root)",
                }
            },
            "required": ["file_path"],
        },
    }
]


# Execute tool function
def execute_tool(tool_name: str, tool_input: dict) -> str:
    """Execute the requested tool and return results."""
    if tool_name == "read_file":
        try:
            file_path = Path(tool_input["file_path"]).resolve()
            content = file_path.read_text(encoding="utf-8")
            return content
        except Exception as e:
            return f"Error reading file: {str(e)}"

    return f"Unknown tool: {tool_name}"


# Main agent orchestration loop
def run_agent(user_message: str) -> None:
    """Run the agent with the given user message."""
    print("\n" + "=" * 60)
    print(f"User: {user_message}")
    print("=" * 60 + "\n")

    messages = [{"role": "user", "content": user_message}]

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        tools=tools,
        messages=messages,
    )

    # Agent loop: continue until we get a text response (not a tool use)
    while response.stop_reason == "tool_use":
        # Find the tool use block
        tool_use = next(
            (block for block in response.content if block.type == "tool_use"), None
        )

        if not tool_use:
            break

        tool_name = tool_use.name
        tool_input = tool_use.input

        print(f"🔧 Agent using tool: {tool_name}")
        print(f"   Input: {json.dumps(tool_input, indent=2)}\n")

        # Execute the tool
        tool_result = execute_tool(tool_name, tool_input)

        # Add assistant response and tool result to messages
        messages.append({"role": "assistant", "content": response.content})
        messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": tool_result,
                    }
                ],
            }
        )

        # Get next response from Claude
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

    # Extract final text response
    final_response = next(
        (block.text for block in response.content if hasattr(block, "text")), None
    )

    if final_response:
        print(f"✅ Agent: {final_response}\n")


# Example usage
def main():
    """Main entry point."""
    try:
        # Example 1: Read a file and analyze it
        run_agent(
            "Read the requirements.txt file and tell me what packages I have installed"
        )

        # Example 2: Try another question
        # run_agent("Read the .env.example file and explain what it's for")

        # Example 3: Read a non-existent file (error handling)
        # run_agent("Read the missing.txt file")

    except Exception as error:
        print(f"Error running agent: {error}")


if __name__ == "__main__":
    main()
