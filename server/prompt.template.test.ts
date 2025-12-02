import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as llm from "./_core/llm";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("prompt.improve with templates", () => {
  it("accepts general template with default configuration", async () => {
    // Mock LLM to avoid real API calls
    vi.spyOn(llm, "invokeLLM").mockResolvedValue({
      choices: [{ message: { content: "Improved prompt", role: "assistant" }, finish_reason: "stop", index: 0 }],
      created: Date.now(), id: "test", model: "test", object: "chat.completion",
    });
    vi.spyOn(db, "createPrompt").mockResolvedValue([{ insertId: 1 }] as any);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prompt.improve({
      originalPrompt: "Create a website",
      templateType: "general",
    });

    expect(result).toBeDefined();
    expect(result.originalPrompt).toBe("Create a website");
    expect(result.improvedPrompt).toBeTruthy();
    expect(typeof result.improvedPrompt).toBe("string");
  });

  it("accepts image template with custom configuration", async () => {
    vi.spyOn(llm, "invokeLLM").mockResolvedValue({
      choices: [{ message: { content: "Detailed image prompt", role: "assistant" }, finish_reason: "stop", index: 0 }],
      created: Date.now(), id: "test", model: "test", object: "chat.completion",
    });
    vi.spyOn(db, "createPrompt").mockResolvedValue([{ insertId: 1 }] as any);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prompt.improve({
      originalPrompt: "A sunset over mountains",
      templateType: "image",
      tone: "creative",
      detailLevel: "comprehensive",
      outputFormat: "structured",
    });

    expect(result).toBeDefined();
    expect(result.originalPrompt).toBe("A sunset over mountains");
    expect(result.improvedPrompt).toBeTruthy();
    expect(result.improvedPrompt).toBe("Detailed image prompt");
  });

  it("accepts code template with technical tone", async () => {
    vi.spyOn(llm, "invokeLLM").mockResolvedValue({
      choices: [{ message: { content: "Technical code prompt", role: "assistant" }, finish_reason: "stop", index: 0 }],
      created: Date.now(), id: "test", model: "test", object: "chat.completion",
    });
    vi.spyOn(db, "createPrompt").mockResolvedValue([{ insertId: 1 }] as any);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prompt.improve({
      originalPrompt: "Build a REST API",
      templateType: "code",
      tone: "technical",
      detailLevel: "balanced",
    });

    expect(result).toBeDefined();
    expect(result.originalPrompt).toBe("Build a REST API");
    expect(result.improvedPrompt).toBeTruthy();
  });

  it("accepts marketing template with professional tone", async () => {
    vi.spyOn(llm, "invokeLLM").mockResolvedValue({
      choices: [{ message: { content: "Marketing copy prompt", role: "assistant" }, finish_reason: "stop", index: 0 }],
      created: Date.now(), id: "test", model: "test", object: "chat.completion",
    });
    vi.spyOn(db, "createPrompt").mockResolvedValue([{ insertId: 1 }] as any);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prompt.improve({
      originalPrompt: "Write an ad for a new product",
      templateType: "marketing",
      tone: "professional",
      detailLevel: "concise",
      outputFormat: "bullet_points",
    });

    expect(result).toBeDefined();
    expect(result.originalPrompt).toBe("Write an ad for a new product");
    expect(result.improvedPrompt).toBeTruthy();
  });

  it("accepts data template with structured format", async () => {
    vi.spyOn(llm, "invokeLLM").mockResolvedValue({
      choices: [{ message: { content: "Data analysis prompt", role: "assistant" }, finish_reason: "stop", index: 0 }],
      created: Date.now(), id: "test", model: "test", object: "chat.completion",
    });
    vi.spyOn(db, "createPrompt").mockResolvedValue([{ insertId: 1 }] as any);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prompt.improve({
      originalPrompt: "Analyze sales data",
      templateType: "data",
      tone: "technical",
      outputFormat: "structured",
    });

    expect(result).toBeDefined();
    expect(result.originalPrompt).toBe("Analyze sales data");
    expect(result.improvedPrompt).toBeTruthy();
  });

  it("rejects empty prompt", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.prompt.improve({
        originalPrompt: "",
        templateType: "general",
      })
    ).rejects.toThrow();
  });
});
