# Copilot Instructions

## Jira Workflow

When the user says **"let's work on 1234"**:

1. Look up Jira issue **KAN-1234**
2. If it exists, create a new branch named `kan-1234` from `main`
3. Move the Jira issue to **In Progress**
4. Read the issue description and acceptance criteria
5. Propose a plan — **do not execute until the user approves**

When the user says **"let's work on the next jira"**:

1. Search for Jira issues in the **TO DO** column (status), ordered by rank
2. Pick the top issue
3. Follow the same process: create branch from `main`, move to In Progress, read the issue, propose a plan, wait for approval

## Push Workflow

When the user says **"push"**:

1. Push the current branch to remote
2. Add a comment to the Jira issue summarizing the changes
3. Move the Jira issue to **Code Review**
4. Open a pull request against `main`
