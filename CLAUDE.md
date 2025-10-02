# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **The Agent Builder's Playbook**, a 7-part tutorial series teaching engineers how to build production-ready AI agents using the Claude Agent SDK. The repository contains educational content and code examples in both TypeScript and Python.

## Repository Structure

The repo is organized as a multi-article tutorial series, with each article in its own directory:

```
01-first-agent/          # Article 1: Setup, mental models, file reader agent
  typescript/            # TypeScript implementation
  python/                # Python implementation
02-documentation-gen/    # Article 2: Multi-tool orchestration
03-memory-checkpoints/   # Article 3: Persistent state and failure recovery
04-test-suite-builder/   # Article 4: Sub-agents and task decomposition
05-nextjs-scaffolder/    # Article 5: Supabase memory, multi-agent coordination
06-specialized-agents/   # Article 6: Content ops + refactoring patterns
07-production-deploy/    # Article 7: Docker, CI/CD, monitoring
```

Each article directory contains:
- `typescript/` - Node.js/TypeScript implementation with SDK examples
- `python/` - Python implementation with anthropic SDK
- `README.md` - Article-specific documentation and learning objectives

## Tech Stack by Article

**Articles 1-3 (Foundation):**
- TypeScript: Node.js 18+, @anthropic-ai/sdk, TypeScript 5+
- Python: Python 3.9+, anthropic SDK, python-dotenv

**Articles 4-6 (Advanced):**
- Jest/Vitest for test generation examples
- Next.js for scaffolding examples
- Supabase for persistent memory patterns

**Article 7 (Production):**
- Docker for containerization
- CI/CD configurations

## Development Workflow

When creating new article content:

1. **Create article directory**: `mkdir 0X-article-name`
2. **Setup both implementations**: Create `typescript/` and `python/` subdirectories
3. **TypeScript setup**:
   ```bash
   cd typescript
   npm init -y
   npm install @anthropic-ai/sdk dotenv
   npm install -D typescript @types/node tsx
   cp .env.example .env  # Add ANTHROPIC_API_KEY
   ```
4. **Python setup**:
   ```bash
   cd python
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install anthropic python-dotenv
   cp .env.example .env  # Add ANTHROPIC_API_KEY
   ```

## Code Standards

**For Tutorial Code:**
- Prioritize clarity and educational value over optimization
- Include extensive comments explaining agent patterns
- Keep examples self-contained and runnable
- Each agent example should demonstrate one core concept clearly

**Environment Variables:**
- All implementations require `ANTHROPIC_API_KEY` in `.env`
- Never commit `.env` files - always use `.env.example` templates
- Later articles may add `SUPABASE_URL`, `SUPABASE_KEY`, etc.

## Agent Patterns Used

This tutorial series teaches these core patterns:
1. **Basic agent loop** - Request/response with Claude (Article 1)
2. **Multi-tool orchestration** - Combining read/write/web tools (Article 2)
3. **Memory & checkpoints** - State persistence and recovery (Article 3)
4. **Sub-agents** - Task decomposition and delegation (Article 4)
5. **Multi-agent coordination** - Parallel agent execution (Article 5)
6. **Specialized agents** - Domain-specific workflows (Article 6)
7. **Production deployment** - Monitoring, scaling, CI/CD (Article 7)

## Target Audience

Code in this repository is written for:
- Mid-to-senior engineers (3+ years experience)
- Developers familiar with TypeScript or Python basics
- Engineers who want production-ready patterns, not toy examples

Avoid:
- Beginner programming tutorials
- Business jargon or high-level strategy content
- Oversimplified examples that won't scale

## Article Development Guidelines

When adding new articles:
- Follow the existing numbering: `0X-descriptive-name/`
- Update README.md with article status and learning objectives
- Provide working examples in both TypeScript and Python
- Include README.md in each language subdirectory with setup instructions
- Test all code before committing - examples must run successfully

## Common Commands

Since each article has different dependencies, refer to the article-specific README for commands. Generally:

**TypeScript:**
```bash
npm install          # Install dependencies
npm start           # Run the agent
npm run dev         # Development mode with auto-reload (if configured)
npm test            # Run tests (Articles 4+)
```

**Python:**
```bash
pip install -r requirements.txt  # Install dependencies
python main.py                   # Run the agent
pytest                          # Run tests (Articles 4+)
```

## License

MIT License - code examples are free to use and modify.
