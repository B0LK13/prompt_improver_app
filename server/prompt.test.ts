import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as llm from "./_core/llm";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("prompt.improve", () => {
  it("improves a prompt and saves it to database", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Mock LLM response
    vi.spyOn(llm, "invokeLLM").mockResolvedValue({
      choices: [
        {
          message: {
            content: "This is an improved, highly detailed prompt with specific requirements and context.",
            role: "assistant",
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
      created: Date.now(),
      id: "test-id",
      model: "test-model",
      object: "chat.completion",
    });

    // Mock database insert
    const mockCreatePrompt = vi.spyOn(db, "createPrompt").mockResolvedValue([{ insertId: 1 }] as any);

    const result = await caller.prompt.improve({
      originalPrompt: "Create a website",
    });

    expect(result.originalPrompt).toBe("Create a website");
    expect(result.improvedPrompt).toContain("improved");
    expect(mockCreatePrompt).toHaveBeenCalledWith({
      userId: 1,
      originalPrompt: "Create a website",
      improvedPrompt: expect.any(String),
    });
  });

  it("throws error if LLM returns empty response", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    vi.spyOn(llm, "invokeLLM").mockResolvedValue({
      choices: [
        {
          message: {
            content: "",
            role: "assistant",
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
      created: Date.now(),
      id: "test-id",
      model: "test-model",
      object: "chat.completion",
    });

    await expect(
      caller.prompt.improve({
        originalPrompt: "Test prompt",
      })
    ).rejects.toThrow("Failed to generate improved prompt");
  });
});

describe("prompt.list", () => {
  it("returns user's prompt history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mockPrompts = [
      {
        id: 1,
        userId: 1,
        originalPrompt: "Test 1",
        improvedPrompt: "Improved 1",
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        originalPrompt: "Test 2",
        improvedPrompt: "Improved 2",
        createdAt: new Date(),
      },
    ];

    vi.spyOn(db, "getUserPrompts").mockResolvedValue(mockPrompts);

    const result = await caller.prompt.list();

    expect(result).toHaveLength(2);
    expect(result[0]?.originalPrompt).toBe("Test 1");
  });
});
