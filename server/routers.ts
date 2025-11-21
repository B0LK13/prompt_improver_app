import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { createPrompt, getUserPrompts, getPromptById, deletePrompt } from "./db";
import { z } from "zod";

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
      .input(z.object({ originalPrompt: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `You are an expert prompt engineer specializing in creating highly detailed, optimized prompts for various AI applications including:
- Text generation (creative writing, technical documentation, business content)
- Image generation (DALL-E, Midjourney, Stable Diffusion)
- Code generation (full-stack applications, algorithms, scripts)
- Data analysis and visualization

Your task is to transform user's basic prompts into comprehensive, structured, and optimized versions that will produce superior results.

When improving a prompt, you should:
1. **Clarify the objective**: Make the goal crystal clear and specific
2. **Add relevant context**: Include background information, constraints, and requirements
3. **Specify format and structure**: Define expected output format, length, style
4. **Include examples**: Provide concrete examples when helpful
5. **Add quality criteria**: Specify what makes a good response
6. **Consider edge cases**: Address potential ambiguities or special scenarios
7. **Optimize for the target model**: Use techniques that work well with modern LLMs

For image generation prompts, include:
- Subject details (appearance, pose, expression)
- Environment and setting
- Lighting and atmosphere
- Art style and medium
- Technical parameters (composition, camera angle)
- Quality modifiers

For code generation prompts, include:
- Technology stack and versions
- Architecture patterns
- Specific requirements and constraints
- Error handling expectations
- Testing requirements
- Performance considerations

For text generation prompts, include:
- Target audience
- Tone and style
- Length and structure
- Key points to cover
- Format specifications

Provide ONLY the improved prompt without any meta-commentary, explanations, or wrapper text.`;

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
