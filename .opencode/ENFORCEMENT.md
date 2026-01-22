# Skills Enforcement System - Human-Readable Guide

> **Audience**: Developers, Team Members, New Contributors  
> **Purpose**: Understand how the skills system works and why it's important  
> **Last Updated**: 2026-01-20

---

## What is This?

MuebleriaIris uses an **agent skills orchestration system** to ensure AI agents (like me!) write consistent, high-quality code that matches your project standards.

Think of it like having a checklist of "rules" that agents must follow before writing any code.

---

## Why Do We Need This?

### The Problem

Without enforcement:
- ❌ Different agents write code in different styles
- ❌ Patterns get inconsistent over time
- ❌ New team members don't know the "right way"
- ❌ Technical debt accumulates

### The Solution

With enforcement:
- ✅ All code follows the same patterns
- ✅ Skills document best practices
- ✅ Onboarding is faster (read the skills!)
- ✅ Quality stays high over time

---

## How It Works

### The Simple Version

```
1. Agent gets task: "Create src/pages/login.astro"
2. Agent reads .clinerules
3. Agent sees: "*.astro files need muebleria-astro skill"
4. Agent invokes skill
5. Agent reads skill guidelines
6. Agent writes code following the guidelines
```

### The File Hierarchy

```
.clinerules
  └─ Primary rules file
     Agents MUST read this first!

.opencode/
  ├── rules.md
  │   └─ Technical details for AI agents
  │
  ├── skills-map.json
  │   └─ Machine-readable pattern mappings
  │
  └── ENFORCEMENT.md
      └─ This file! Human-readable guide

agents/
  ├── muebleria-astro/SKILL.md
  ├── muebleria-react/SKILL.md
  └── ... (individual skill files)

AGENTS.md
  └─ Quick reference catalog
```

---

## The Rules

### When Skills Are Required

Skills are MANDATORY when an agent is:

| Action | Required? |
|--------|-----------|
| **Reading** a file | ❌ No |
| **Creating** a new file | ✅ YES |
| **Modifying** existing code | ✅ YES |
| **Deleting** a file | ❌ No |
| **Moving/Renaming** a file | ⚠️ Maybe (if patterns change) |

### File Pattern Matching

The system uses **glob patterns** to match files to skills:

| Pattern | Example Files | Required Skills |
|---------|---------------|-----------------|
| `src/pages/**/*.astro` | `src/pages/login.astro` | `muebleria-astro`, `muebleria-ui` |
| `src/components/ui/**/*.tsx` | `src/components/ui/Button.tsx` | `muebleria-react`, `muebleria-ui` |
| `**/*Form*.tsx` | `LoginForm.tsx`, `CheckoutForm.tsx` | `muebleria-forms`, `muebleria-react` |
| `backend/app/routes/**/*.py` | `backend/app/routes/auth.py` | `muebleria-api`, `muebleria-python` |

**Full list**: See [`.clinerules`](../.clinerules)

---

## For Developers

### What You Need to Know

1. **The system is automatic** - Agents should invoke skills without you asking
2. **Skills are documentation** - Read them to understand patterns
3. **Skills evolve** - Update them as the project grows
4. **Violations are visible** - Code reviews will catch non-compliance

### How to Create a New Skill

```bash
# Use the skills-creator skill
# (Meta, right?)

# Or manually:
mkdir -p agents/my-new-skill
cp agents/_template/SKILL.md agents/my-new-skill/
# Edit the skill file
# Add pattern to .clinerules
# Update .opencode/skills-map.json
# Run agents/sync-skills.sh
```

### How to Update an Existing Skill

```bash
# 1. Edit the skill file
vi agents/muebleria-react/SKILL.md

# 2. Test with an agent
# Ask agent to create a component and verify it follows the updated skill

# 3. Commit changes
git add agents/muebleria-react/SKILL.md
git commit -m "docs(skills): update React 19 patterns"
```

---

## For New Team Members

### Quick Start

1. **Read `.clinerules`** - Understand the mandatory rules
2. **Browse `agents/`** - See what patterns exist
3. **Check `AGENTS.md`** - Get an overview of all skills
4. **Ask the agent** - Say "which skills apply to this file?"

### Common Questions

**Q: Do I need to follow the skills when I write code manually?**  
A: YES! Skills are the project's coding standards.

**Q: What if a skill conflicts with my preference?**  
A: Discuss with the team. If we agree, update the skill.

**Q: Can I skip skills for a quick prototype?**  
A: Ask the team lead. Document any deviations.

**Q: How do I know if I'm following a skill correctly?**  
A: Ask an AI agent to review your code against the skill.

---

## For AI Agents

### Your Responsibilities

1. **ALWAYS** read `.clinerules` before modifying files
2. **MATCH** file patterns to required skills
3. **INVOKE** skills using the Skill tool
4. **READ** skill guidelines completely
5. **APPLY** patterns from skills
6. **VERIFY** your implementation matches

### Example Workflow

```
User: "Create src/pages/products.astro"

You:
  Step 1: Read .clinerules
  Step 2: Match pattern: src/pages/**/*.astro
  Step 3: Required skills: muebleria-astro, muebleria-ui
  Step 4: Invoke Skill(name="muebleria-astro")
  Step 5: Invoke Skill(name="muebleria-ui")
  Step 6: Read both skill outputs
  Step 7: Create file using:
          - Astro 5 Islands architecture
          - TailwindCSS 4 utilities
          - TypeScript
          - Patterns from skills
  Step 8: Verify against skill checklists
```

### What If...

**...no pattern matches?**
- State clearly: "No exact pattern match for this file"
- Use general best practices
- Document your reasoning

**...skill file is missing?**
- Log warning: "Required skill X not found"
- Use official framework documentation
- Recommend creating the missing skill

**...user says "skip skills"?**
- Acknowledge request
- Warn about potential inconsistency
- Proceed but document the deviation

---

## Real-World Examples

### Example 1: Creating a Form Component

**Task**: Create `src/components/auth/LoginForm.tsx`

**Agent Process**:
1. Reads `.clinerules`
2. Matches patterns:
   - `**/*Form*.tsx` → muebleria-forms
   - `src/components/**/*.tsx` → muebleria-react
3. Invokes skills: `muebleria-forms`, `muebleria-react`
4. Reads guidelines:
   - Use react-hook-form
   - Use Zod for validation
   - TypeScript with proper typing
   - Accessible form fields
5. Creates component following all patterns

**Result**: ✅ Consistent, validated, accessible form

---

### Example 2: Creating an API Endpoint

**Task**: Create `backend/app/routes/users.py`

**Agent Process**:
1. Reads `.clinerules`
2. Matches: `backend/app/routes/**/*.py`
3. Invokes: `muebleria-api`, `muebleria-python`
4. Applies patterns:
   - Flask blueprint structure
   - Input validation with schemas
   - Error handling middleware
   - Type hints
   - Docstrings
5. Creates endpoint with all patterns

**Result**: ✅ Secure, validated, documented API

---

### Example 3: Mixed Frontend/Backend Task

**Task**: "Add user profile page with API endpoint"

**Files**:
- `src/pages/profile.astro`
- `src/components/profile/ProfileForm.tsx`
- `backend/app/routes/profile.py`

**Agent Process**:
1. Identifies 3 files to create
2. Collects all required skills:
   - muebleria-astro (for .astro page)
   - muebleria-ui (for .astro page)
   - muebleria-forms (for Form component)
   - muebleria-react (for Form component)
   - muebleria-api (for API route)
   - muebleria-python (for API route)
3. Invokes all skills (deduped)
4. Creates all 3 files following patterns

**Result**: ✅ Cohesive feature across stack

---

## Troubleshooting

### Problem: Agent Not Invoking Skills

**Symptoms**:
- Code doesn't match project patterns
- Agent jumps straight to writing code
- No mention of skills in agent output

**Solution**:
1. Check if `.clinerules` exists and is readable
2. Verify agent has access to Skill tool
3. Explicitly instruct: "Follow the rules in .clinerules"
4. Report issue if problem persists

---

### Problem: Skills Conflict with Each Other

**Symptoms**:
- Skill A says use pattern X
- Skill B says use pattern Y
- Both skills apply to same file

**Solution**:
1. Check skill priority in `.opencode/skills-map.json`
2. More specific patterns win
3. If still unclear, ask team lead
4. Update skills to clarify

---

### Problem: Skill is Outdated

**Symptoms**:
- Skill references old library version
- Patterns don't work with current tech stack
- Agent produces deprecated code

**Solution**:
1. Update the skill file immediately
2. Test with agent
3. Commit updated skill
4. Notify team of changes

---

## Metrics & Quality

### How We Measure Success

- **Consistency**: % of code reviews with no style issues
- **Onboarding**: Time for new developer to first PR
- **Agent Performance**: % of agent outputs accepted without modification
- **Skill Coverage**: % of files with matching patterns

### Current Status

| Metric | Target | Current |
|--------|--------|---------|
| Pattern Coverage | 90% | ~85% |
| Agent Compliance | 95% | TBD |
| Developer Satisfaction | 4/5 | TBD |

---

## Best Practices

### For Writing Skills

✅ **DO**:
- Be specific and actionable
- Include code examples
- Explain the "why" behind patterns
- Keep skills focused (one concern per skill)
- Update skills when tech stack changes

❌ **DON'T**:
- Write vague guidelines
- Mix multiple concerns in one skill
- Assume knowledge (explain everything)
- Let skills go stale

### For Using Skills

✅ **DO**:
- Read skills before coding
- Follow patterns exactly
- Ask questions if unclear
- Propose improvements

❌ **DON'T**:
- Skip skills for "speed"
- Ignore patterns you disagree with (discuss instead)
- Create exceptions without documentation
- Forget to update skills when changing patterns

---

## Resources

### Primary Files
- [`.clinerules`](../.clinerules) - Mandatory rules (read first!)
- [`.opencode/rules.md`](./rules.md) - Technical agent guide
- [`.opencode/skills-map.json`](./skills-map.json) - Pattern mappings
- [`AGENTS.md`](../AGENTS.md) - Skills catalog

### Skill Directories
- [`agents/`](../agents/) - All skill implementations
- [`agents/_template/`](../agents/_template/) - Template for new skills

### Additional Docs
- [`GUIA-SUBAGENTES.md`](../GUIA-SUBAGENTES.md) - Complete system guide
- [`QUICK-START.md`](../QUICK-START.md) - 5-minute setup

---

## FAQ

**Q: Is this overkill for a small project?**  
A: It scales. Start with a few skills, add more as needed.

**Q: What if I don't use AI agents?**  
A: Skills are still useful as coding standards documentation.

**Q: Can I use this system in other projects?**  
A: Yes! It's a general pattern for any project.

**Q: How much time does this add to development?**  
A: -20% in the long run (saves time via consistency).

**Q: What if skills and linters conflict?**  
A: Linters are source of truth. Update skills to match.

---

## Changelog

### v1.0.0 (2026-01-20)
- Initial enforcement system
- Created `.clinerules`
- Created `.opencode/rules.md`
- Created `.opencode/skills-map.json`
- Updated `AGENTS.md`
- Created this document

---

**Questions?** Open an issue or ask in team chat.

**Improvements?** Submit a PR updating this file and the related rules.

---

**Last Updated**: 2026-01-20  
**Maintained By**: MuebleriaIris Development Team  
**Status**: Active and Enforced
