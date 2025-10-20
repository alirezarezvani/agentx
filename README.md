# The Agent Builder's Playbook: Mastering Claude Agent SDK

A hands-on, 7-part series for mid-to-senior engineers who want to build real AI agents. No hype, no business metrics—just working code and engineering fundamentals.

---

## 🎯 What You'll Build

By the end of this series, you'll have built production-ready agents including:

1. **File Reader Agent** - Autonomous tool use and agent loops
2. **Documentation Generator** - Reads codebases and writes README files
3. **MCP-Powered Agents** - Browser automation, persistent memory, doc lookup via MCP servers
4. **Test Suite Builder** - Generates Jest/Vitest tests automatically
5. **Next.js App Scaffolder** - Creates full project structures with routing and components
6. **Content Operations Agent** - Editorial workflows and markdown processing
7. **Refactoring Assistant** - Code migrations (Class → Hooks, CommonJS → ESM)

---

## 📚 Series Structure

### Phase 1: Foundation (Articles 1-3)
*Build core skills and your first working agents*

- **[Article 1: Your First Autonomous Agent](./01-first-agent/)** - Setup, mental models, file reader agent
- **[Article 2: Documentation Generator](./02-documentation-generator/)** - Multi-tool orchestration
- **Article 3: Memory & Checkpoints** *(Coming Soon)* - Persistent state and failure recovery

### Phase 2: Advanced Patterns (Articles 4-5)
*Complex orchestration and production memory*

- **Article 4: Test Suite Builder** *(Coming Soon)* - Sub-agents and task decomposition
- **Article 5: Next.js Scaffolder** *(Coming Soon)* - Supabase memory, multi-agent coordination

### Phase 3: Real-World Mastery (Articles 6-8)
*Specialized agents, MCP integration, and production deployment*

- **Article 6: Specialized Agents** *(Coming Soon)* - Content ops + refactoring patterns
- **Article 7: Production Deployment** *(Coming Soon)* - Docker, CI/CD, monitoring
- **[Article 8: MCP Server Integration](./08-mcp-integration/)** - Extend agents with browser automation, memory, and doc lookup

---

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
```

---

## 🛠️ Tech Stack

### TypeScript (Primary)
- Node.js 18+
- @anthropic-ai/sdk
- TypeScript 5+

### Python (Full Implementations)
- Python 3.9+
- anthropic SDK
- python-dotenv

### Later Articles
- Model Context Protocol / MCP (Article 8)
- Next.js (Article 5)
- Supabase (Articles 5-6)
- Docker (Article 7)
- Jest/Vitest (Article 4)

---

## 📖 Who This Is For

### You should read this series if you:
- ✅ Have 2+ years of software engineering experience
- ✅ Know some TypeScript or Python basics
- ✅ Want to build real agents, not toy examples
- ✅ Care about production-ready patterns
- ✅ Prefer code over business jargon

### You can skip this series if you:
- ❌ Want high-level AI strategy content
- ❌ Need beginner programming tutorials
- ❌ Prefer GUI tools over code
- ❌ Want business case studies

---

## 🎓 Learning Path

### Linear Path (Recommended for beginners)
Follow Articles 1→7 in order. Each builds on previous concepts.

### Standalone Path (For experienced developers)
- Want to build a specific agent? Jump to that article
- Need memory patterns? Start with Article 3
- Want browser automation or external tools? Go to Article 8 (MCP Integration)
- Production deployment? Go straight to Article 7

---

## 🤝 Contributing

Found a bug? Have a better pattern? PRs welcome!

### Guidelines
- Keep code simple and well-commented
- Test all examples before submitting
- Match the existing code style
- Update READMEs with any new setup steps

---

## 📝 License

MIT License - use this code however you want.

---

## 🔗 Links

- **[Medium Series](https://medium.com/@alirezarezvani)** - Read the full articles
- **[Claude Agent SDK Docs](https://docs.anthropic.com/en/docs/build-with-claude/agent-computer-use)** - Official documentation
- **[Anthropic Console](https://console.anthropic.com)** - Get your API key

---

## 👨‍💻 Author

**Alireza Rezvani**
*CTO | Senior Full-Stack Engineer | AI Engineering*

- 📝 Medium: [@alirezarezvani](https://alirezarezvani.medium.com/)
- 💼 LinkedIn: [alirezarezvani](https://linkedin.com/in/alirezarezvani)
- 🐙 GitHub: [@alirezarezvani](https://github.com/alirezarezvani)

---

*Built with curiosity, debugged with patience, shipped with confidence.*
