# The Agent Builder's Playbook: Mastering Claude Agent SDK

A hands-on, 7-part series for mid-to-senior engineers who want to build real AI agents. No hype, no business metrics—just working code and engineering fundamentals.

## 🎯 What You'll Build

By the end of this series, you'll have built 6 production-ready agents:

1. **Documentation Generator** - Reads codebases and writes README files
2. **Test Suite Builder** - Generates Jest/Vitest tests automatically
3. **Next.js App Scaffolder** - Creates full project structures with routing and components
4. **Content Operations Agent** - Editorial workflows and markdown processing
5. **Refactoring Assistant** - Code migrations (Class → Hooks, CommonJS → ESM)
6. **Production Log Analyzer** - Parses logs, finds patterns, identifies root causes

## 📚 Series Structure

### Phase 1: Foundation (Articles 1-3)
Build core skills and your first working agents

- **[Article 1: Your First Autonomous Agent](./01-first-agent/)** - Setup, mental models, file reader agent
- **Article 2: Documentation Generator** *(Coming Soon)* - Multi-tool orchestration
- **Article 3: Memory & Checkpoints** *(Coming Soon)* - Persistent state and failure recovery

### Phase 2: Advanced Patterns (Articles 4-5)
Complex orchestration and production memory

- **Article 4: Test Suite Builder** *(Coming Soon)* - Sub-agents and task decomposition
- **Article 5: Next.js Scaffolder** *(Coming Soon)* - Supabase memory, multi-agent coordination

### Phase 3: Real-World Mastery (Articles 6-7)
Specialized agents and production deployment

- **Article 6: Specialized Agents** *(Coming Soon)* - Content ops + refactoring patterns
- **Article 7: Production Deployment** *(Coming Soon)* - Docker, CI/CD, monitoring

## 🚀 Quick Start

Each article has its own directory with both TypeScript and Python implementations.
```bash
# Clone the repo
git clone https://github.com/rezarezvani/agent-builders-playbook.git
cd agent-builders-playbook

# Start with Article 1
cd 01-first-agent/typescript
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm start
