import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { createPrompt, getUserPrompts, getPromptById, deletePrompt } from "./db";
import { z } from "zod";
import { getSystemPrompt, type PromptConfig } from "./templates";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  prompt: router({
    improve: protectedProcedure
      .input(z.object({ 
        originalPrompt: z.string().min(1),
        templateType: z.enum(["general", "image", "code", "marketing", "data"]).default("general"),
        tone: z.enum(["professional", "casual", "technical", "creative"]).optional(),
        detailLevel: z.enum(["concise", "balanced", "comprehensive"]).optional(),
        outputFormat: z.enum(["structured", "narrative", "bullet_points"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const config: PromptConfig = {
          templateType: input.templateType,
          tone: input.tone,
          detailLevel: input.detailLevel,
          outputFormat: input.outputFormat,
        };
        
        const systemPrompt = getSystemPrompt(config);

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Original prompt: "${input.originalPrompt}"\n\nProvide an improved, highly detailed version of this prompt.` },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const improvedPrompt = typeof messageContent === 'string' ? messageContent : '';

        if (!improvedPrompt) {
          throw new Error("Failed to generate improved prompt");
        }

        await createPrompt({
          userId: ctx.user.id,
          originalPrompt: input.originalPrompt,
          improvedPrompt: improvedPrompt,
          templateType: input.templateType,
          tone: input.tone,
          detailLevel: input.detailLevel,
          outputFormat: input.outputFormat,
        });

        return {
          originalPrompt: input.originalPrompt,
          improvedPrompt,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPrompts(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPromptById(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deletePrompt(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
