export type TemplateType = "general" | "image" | "code" | "marketing" | "data";
export type Tone = "professional" | "casual" | "technical" | "creative";
export type DetailLevel = "concise" | "balanced" | "comprehensive";
export type OutputFormat = "structured" | "narrative" | "bullet_points";

export interface PromptConfig {
  templateType: TemplateType;
  tone?: Tone;
  detailLevel?: DetailLevel;
  outputFormat?: OutputFormat;
}

export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  general: "Versatile optimization for any prompt type",
  image: "Optimized for image generation (DALL-E, Midjourney, Stable Diffusion)",
  code: "Optimized for code generation and technical implementations",
  marketing: "Optimized for marketing copy, ads, and business content",
  data: "Optimized for data analysis, visualization, and research tasks",
};

function getBaseSystemPrompt(config: PromptConfig): string {
  const toneMap: Record<Tone, string> = {
    professional: "professional, authoritative, and business-focused",
    casual: "conversational, friendly, and approachable",
    technical: "precise, technical, and detailed with industry terminology",
    creative: "imaginative, expressive, and innovative",
  };

  const detailMap: Record<DetailLevel, string> = {
    concise: "Keep the improved prompt concise and focused on essential elements only.",
    balanced: "Provide a well-balanced prompt with appropriate detail and structure.",
    comprehensive: "Create an extremely detailed, comprehensive prompt covering all aspects thoroughly.",
  };

  const formatMap: Record<OutputFormat, string> = {
    structured: "Use clear sections, headings, and structured formatting.",
    narrative: "Present the prompt as a flowing narrative with natural language.",
    bullet_points: "Organize information using bullet points and lists for clarity.",
  };

  const tone = config.tone || "professional";
  const detailLevel = config.detailLevel || "balanced";
  const outputFormat = config.outputFormat || "structured";

  return `You are an expert prompt engineer. Your task is to transform basic prompts into optimized versions.

**Tone**: ${toneMap[tone]}
**Detail Level**: ${detailMap[detailLevel]}
**Format**: ${formatMap[outputFormat]}

Provide ONLY the improved prompt without meta-commentary or explanations.`;
}

export function getSystemPrompt(config: PromptConfig): string {
  const basePrompt = getBaseSystemPrompt(config);

  const templatePrompts: Record<TemplateType, string> = {
    general: `${basePrompt}

When improving prompts:
1. Clarify the objective and make it specific
2. Add relevant context and constraints
3. Specify expected output format and structure
4. Include quality criteria
5. Address potential ambiguities
6. Optimize for modern LLMs`,

    image: `${basePrompt}

Specialize in image generation prompts. Include:
- **Subject Details**: Appearance, pose, expression, clothing
- **Environment**: Setting, location, background elements
- **Lighting**: Type, direction, mood, time of day
- **Style**: Art style, medium, artistic influences
- **Technical**: Composition, camera angle, perspective
- **Quality Modifiers**: Resolution, detail level, rendering quality
- **Negative Prompts**: Elements to avoid (when applicable)`,

    code: `${basePrompt}

Specialize in code generation prompts. Include:
- **Technology Stack**: Languages, frameworks, versions
- **Architecture**: Design patterns, project structure
- **Requirements**: Functional and non-functional requirements
- **Constraints**: Performance, security, scalability considerations
- **Error Handling**: Expected error scenarios and handling
- **Testing**: Unit tests, integration tests requirements
- **Documentation**: Code comments and documentation standards
- **Best Practices**: Industry standards and conventions`,

    marketing: `${basePrompt}

Specialize in marketing and business content. Include:
- **Target Audience**: Demographics, psychographics, pain points
- **Value Proposition**: Key benefits and unique selling points
- **Tone & Voice**: Brand personality and communication style
- **Call to Action**: Clear, compelling CTAs
- **Format**: Email, ad copy, landing page, social media
- **Length**: Word count or character limits
- **Key Messages**: Core points to communicate
- **Competitive Context**: Market positioning`,

    data: `${basePrompt}

Specialize in data analysis and research. Include:
- **Data Sources**: Types and formats of data
- **Analysis Goals**: Specific questions to answer
- **Methodology**: Statistical methods, algorithms
- **Visualization**: Chart types, dashboard requirements
- **Metrics**: KPIs and success criteria
- **Output Format**: Reports, dashboards, presentations
- **Audience**: Technical level of stakeholders
- **Constraints**: Time, resources, data limitations`,
  };

  return templatePrompts[config.templateType];
}
