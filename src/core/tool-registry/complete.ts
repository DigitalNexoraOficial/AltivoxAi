/**
 * Tool Registry — runtime mínimo (Bloque 5 · ADR-015).
 * Only tool: llm.complete
 */

import { can, type Subject } from "@/core/security";
import { AgentError } from "@/core/agent-runtime/errors";
import { isAllowedTool } from "@/core/agent-runtime/states";

export type { ToolRegistry } from "./frontier";

export type LlmCompleteInput = {
  prompt: string;
  system?: string;
};

export type LlmCompleteResult = {
  text: string;
  provider: string;
};

type Completer = (input: LlmCompleteInput) => Promise<LlmCompleteResult>;

let testCompleter: Completer | null = null;

/** Selftests — deterministic LLM without vendors. */
export function setLlmCompleterForTests(fn: Completer | null): void {
  testCompleter = fn;
}

async function defaultComplete(
  input: LlmCompleteInput
): Promise<LlmCompleteResult> {
  if (testCompleter) return testCompleter(input);
  if (process.env.ALTIVOX_SELFTEST === "1") {
    return {
      text: `[selftest] ${input.prompt.slice(0, 200)}`,
      provider: "selftest",
    };
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
        messages: [
          ...(input.system
            ? [{ role: "system", content: input.system }]
            : []),
          { role: "user", content: input.prompt },
        ],
      }),
    });
    if (!orRes.ok) {
      throw new AgentError("execution_error", "llm_provider_error");
    }
    const data = (await orRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content || "";
    return { text, provider: "openrouter" };
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`;
    const gemRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: input.system
                  ? `${input.system}\n\n${input.prompt}`
                  : input.prompt,
              },
            ],
          },
        ],
      }),
    });
    if (!gemRes.ok) {
      throw new AgentError("execution_error", "llm_provider_error");
    }
    const data = (await gemRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { text, provider: "gemini" };
  }

  throw new AgentError("execution_error", "llm_not_configured");
}

/**
 * Unique Tool Registry entry for B5.
 * Requires can(subject, "tool.execute").
 */
export async function completeLlm(
  subject: Subject,
  input: LlmCompleteInput
): Promise<LlmCompleteResult> {
  const decision = can(subject, "tool.execute");
  if (!decision.allowed) {
    throw new AgentError("forbidden", decision.reason, 403);
  }
  if (!isAllowedTool("llm.complete")) {
    throw new AgentError("tool_denied", "tool_not_allowlisted");
  }
  const prompt = String(input.prompt || "").trim();
  if (!prompt) {
    throw new AgentError("invalid_input", "prompt_required");
  }
  return defaultComplete({
    prompt: prompt.slice(0, 20000),
    system: input.system ? String(input.system).slice(0, 8000) : undefined,
  });
}

export function assertToolAllowed(toolId: string): void {
  if (!isAllowedTool(toolId)) {
    throw new AgentError("tool_denied", `tool_not_allowed:${toolId}`);
  }
}
