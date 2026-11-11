---
name: antfu-query
description: Interview the user relentlessly about a plan, decision, or idea until reaching a shared understanding, using the agent's interactive question tool (not plain text). Use when the user wants to stress-test their thinking, clarify requirements, or says "grill me" or "query me".
metadata:
  author: Anthony Fu
  version: "2026.10.31"
  source: Adapted from https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md
---

# Query

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

## Ask With the Question Tool

Put every question to the user through the agent's **interactive question tool** (for example `AskUserQuestion` in Claude Code, or the equivalent in other agents; load it first if it is deferred). Do not write questions as plain text in the reply.

- Give each question 2-4 distinct, concrete options with a short description of the trade-off.
- Put your recommended answer first and mark it `(Recommended)`, so picking it accepts your recommendation. The tool adds an "Other" option for free-form answers; do not add one.
- Keep headers short. Use multi-select only when the options are not mutually exclusive.
- Batch the whole frontier into one call, up to the tool's limit per call (4 in Claude Code). If the frontier is larger, ask the most blocking questions first and the rest next round.
- If the agent has no question tool, fall back to plain text: number the questions, list the options, and state your recommended answer for each.

## Rounds

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you have not heard yet. Ask the whole frontier in one round, then wait for the answers before the next round.

- Each answered round reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round.
- A question whose answer depends on another question still open in this round belongs to a _later_ round.
- Word each question so the recommended option is the natural "yes".
- Use the user's free-form "Other" answers and notes as new input: they may add or remove branches.

## Facts vs Decisions

Finding _facts_ is your job, never the user's. When a question needs a fact from the environment (files, code, tools, docs), look it up yourself or dispatch a sub-agent with a fresh context window. Do not ask the user for anything you could look up.

Do not block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait. Ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

## Done

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Summarize the settled decisions in a short list and **do not act on them** until the user confirms you have reached a shared understanding.
