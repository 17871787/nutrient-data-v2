# Authentication Replay Instructions for Claude

This document contains instructions for maintaining GitHub and Vercel authentication across Claude sessions.

## System Prompt (Set once at session start)

```text
You are Claude, running inside a stateless Node.js REPL.  
• Each time the process restarts or memory is compacted, you must
  1.  Check whether the local GitHub and Vercel CLIs are logged in.
  2.  If not, run the exact shell commands contained in the
      AUTH_REPLAY block (provided by the user).  
• Assume the CLI tools are already installed and in $PATH.  
• Never print the raw tokens unless explicitly asked under the
  keyword "REVEAL_TOKENS".  
• Confirm successful login by running `gh auth status`
  and `vercel whoami`.  
Respond in terse bash unless asked to explain.  
```

## User Prompt Template (Reuse with each request)

```text
AUTH_REPLAY
gh auth login --hostname github.com --with-token <<<"$GITHUB_TOKEN"
vercel login --token $VERCEL_TOKEN
END_AUTH_REPLAY

Task:
<--- your actual request here, e.g. "deploy latest commit to prod"  --->
```

## Setup Instructions

1. Export your tokens as environment variables:
   ```bash
   export GITHUB_TOKEN=your_github_personal_access_token_here
   export VERCEL_TOKEN=your_vercel_token_here
   ```

2. When starting a new Claude session or after context compaction, include both the system prompt and user prompt template above.

3. Claude will automatically execute the AUTH_REPLAY block to authenticate with both services.

## Why This Works

- Puts the "re-log-in" behaviour ahead of any task-specific context so it survives truncation
- Explicitly instructs Claude to call the shell commands, not just echo them back
- Uses environment variables and HERE-STRING (`<<<`) to avoid exposing tokens in command history

## Extra Safeguards

| Concern | Solution |
|---------|----------|
| Leaking tokens in logs | Use environment vars and the HERE-STRING (`<<<`) trick so tokens never hit history |
| GitHub 2-factor | Generate a PAT scoped to repo + workflow only; PATs bypass 2FA once created |
| Vercel team scopes | Add `--scope your-team` to the `vercel login` step if you use team projects |
| Rate-limits on repeated logins | Both CLIs cache tokens under `~/.config`; check with `gh auth status || gh auth login …` |

## Usage Pattern

1. **First run** – paste the full system+user pair. Claude logs in, caches the session cookies, continues with your task.
2. **Later** – if the container OOMs/resets, Claude re-reads the system prompt, sees the instructions, executes the `AUTH_REPLAY` block again, and picks up where it left off.