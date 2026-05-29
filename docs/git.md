# Git Rules for AI Agents

Every time an AI agent creates or updates a file in this `app/app` project, it
must generate git commands for that file.

## Mandatory Rule

- Generate one `git add` and one `git commit -m "Message"` per created or updated file.
- No two files may share the same commit message.
- Commit messages must be professional, meaningful, and specific.
- Every generated commit command block must state `Project: app/app`.
- Paths must be relative to the `app/app` project root.
- Do not prefix paths with `app/app/`.
- Do not use `git add .`.

## Example

```bash
git add "src/services/api/auth/login.ts"
git commit -m "feat(auth): add login endpoint client"
```
