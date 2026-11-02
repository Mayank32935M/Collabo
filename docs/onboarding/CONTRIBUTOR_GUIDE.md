# Contributor Guide — COLLABO

> **Document Status:** Approved (Milestone M1.5 Specification)  
> **Philosophy:** Human-Led, AI-Assisted, Learning-Oriented Engineering  
> **Target Audience:** All Human and AI Contributors

---

## 1. Our Engineering Culture

COLLABO is developed under an open, supportive, and learning-focused philosophy:
1. **Understanding Over Rushing:** We prioritize deep understanding of architecture, distributed systems, and clean code over fast, messy scaffolding.
2. **Atomic, Reviewable Changes:** We make small, verifiable changes rather than monolithic 50-file diffs.
3. **No Unverified Claims:** Never claim a feature works or tests passed without running actual commands and inspecting the output.

---

## 2. Git Branching Strategy

* **Active Redesign Branch:** `redesign/product-architecture` (current working trunk for the platform redesign).
* **Production Baseline Branch:** `main`.
* **Feature Branches:** Always branch off `redesign/product-architecture`:
  ```bash
  # Create and checkout a feature branch
  git checkout -b feat/whiteboard-pan-zoom
  git checkout -b fix/pen-drag-coordinates
  git checkout -b docs/learning-notes-webrtc
  ```

---

## 3. Commit Message Standards (Conventional Commits)

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary in present tense>

[optional body explaining WHY this change was made]
```

### Allowed Types:
* `feat`: A new user-facing capability or package feature (e.g. `feat(realtime): add speaking queue handlers`).
* `fix`: A bug fix (e.g. `fix(web): resolve pen line coordinate reset on drag`).
* `docs`: Documentation updates only (e.g. `docs(architecture): add realtime event catalog`).
* `refactor`: Code change that neither fixes a bug nor adds a feature.
* `test`: Adding or updating automated tests.
* `chore`: Maintenance tasks, lockfile updates, or tooling configs.

---

## 4. Pre-Commit Verification Checklist

Before opening a pull request or pushing your commits, execute this 3-step check:

```bash
# 1. Verify TypeScript compiles across all packages (0 errors)
pnpm typecheck

# 2. Verify ESLint passes with zero warnings or errors
pnpm lint

# 3. Verify the realtime server compiles
pnpm --filter @collabo/realtime build
```

---

## 5. Pull Request (PR) Template

When opening a PR to `redesign/product-architecture`, provide this structured summary:

```markdown
### What Does This PR Do?
<!-- Concise 2-3 sentence overview of the problem solved and the approach taken -->

### Relevant Files Changed
* `apps/...`: [Reason for change]
* `packages/...`: [Reason for change]

### How Was This Tested?
* [ ] `pnpm typecheck` passed cleanly (attach output)
* [ ] `pnpm lint` passed cleanly (attach output)
* [ ] Manual verification in browser (list steps taken)

### Technical Concepts / Learning Reflection
<!-- Explain one technical concept you learned or applied during this task -->
```

