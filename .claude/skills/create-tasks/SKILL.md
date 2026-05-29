---
name: create-tasks
description: >
  Break down a feature or goal into GitHub issues and add them to the project board.
  Invoke this when the user describes a feature to build.
agent: pm-tasks
---

Break down the following into GitHub issues for the project board:

$FEATURE_OR_GOAL

Steps:
1. Identify all sub-tasks needed (frontend, backend, legal validation, infra)
2. Write each as a proper GitHub issue with user story + acceptance criteria
3. Add appropriate labels and priority
4. Create the issues via GitHub MCP
5. Report back with a summary table of all issues created
