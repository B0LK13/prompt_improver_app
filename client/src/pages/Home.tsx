import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Streamdown } from 'streamdown';
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, ArrowRight, History, Loader2, Sparkles, Settings2 } from "lucide-react";
import { Link } from "wouter";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TemplateType = "general" | "image" | "code" | "marketing" | "data";
type Tone = "professional" | "casual" | "technical" | "creative";
type DetailLevel = "concise" | "balanced" | "comprehensive";
type OutputFormat = "structured" | "narrative" | "bullet_points";

const TEMPLATES: Record<TemplateType, { label: string; description: string }> = {
  general: { label: "General", description: "Versatile optimization for any prompt type" },
  image: { label: "Image Generation", description: "DALL-E, Midjourney, Stable Diffusion" },
  code: { label: "Code Generation", description: "Technical implementations and algorithms" },
  marketing: { label: "Marketing", description: "Ads, copy, and business content" },
  data: { label: "Data Analysis", description: "Research and visualization tasks" },
};

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("general");
  const [tone, setTone] = useState<Tone | undefined>("professional");
  const [detailLevel, setDetailLevel] = useState<DetailLevel | undefined>("balanced");
  const [outputFormat, setOutputFormat] = useState<OutputFormat | undefined>("structured");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const improveMutation = trpc.prompt.improve.useMutation({
    onSuccess: (data) => {
      setImprovedPrompt(data.improvedPrompt);
      toast.success("Prompt optimized successfully");
    },
    onError: (error) => {
      toast.error("Optimization failed: " + error.message);
    },
  });

  const handleImprove = () => {
    if (!originalPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    improveMutation.mutate({ 
      originalPrompt,
      templateType,
      tone,
      detailLevel,
      outputFormat,
    });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="space-y-6 text-center">
              <h1 className="text-5xl font-light tracking-tight">
                {APP_TITLE}
              </h1>
              <p className="text-xl text-muted-foreground font-light">
                Transform basic prompts into detailed, optimized instructions for AI applications
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 text-center">
              <div className="space-y-3">
                <div className="text-3xl font-light">01</div>
                <h3 className="font-medium">AI Enhancement</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced language models analyze and expand your prompts with precision
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-light">02</div>
                <h3 className="font-medium">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Receive optimized prompts in seconds with detailed specifications
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-light">03</div>
                <h3 className="font-medium">Full History</h3>
                <p className="text-sm text-muted-foreground">
                  Access and manage all improved prompts with complete tracking
                </p>
              </div>
            </div>

            <div className="text-center pt-8">
              <Button size="lg" asChild variant="outline" className="px-8">
                <a href={getLoginUrl()}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-light tracking-wide">{APP_TITLE}</h1>
            <div className="flex items-center gap-6">
              <Link href="/history">
                <Button variant="ghost" size="sm" className="font-light">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-light tracking-tight">Prompt Optimization</h2>
            <p className="text-muted-foreground font-light">
              Select a template and configure options for tailored enhancement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-lg font-light">Input</CardTitle>
                  <CardDescription className="font-light">
                    Your original prompt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-select" className="text-sm font-light">Template</Label>
                    <Select value={templateType} onValueChange={(value) => setTemplateType(value as TemplateType)}>
                      <SelectTrigger id="template-select" className="bg-background border-border font-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {Object.entries(TEMPLATES).map(([key, { label, description }]) => (
                          <SelectItem key={key} value={key} className="font-light">
                            <div className="flex flex-col items-start">
                              <span>{label}</span>
                              <span className="text-xs text-muted-foreground">{description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-input" className="text-sm font-light">Prompt</Label>
                    <Textarea
                      id="prompt-input"
                      placeholder="Enter your prompt..."
                      value={originalPrompt}
                      onChange={(e) => setOriginalPrompt(e.target.value)}
                      className="min-h-[200px] resize-none bg-background border-border font-light"
                    />
                  </div>

                  <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full font-light">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Advanced Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="font-light">Advanced Settings</DialogTitle>
                        <DialogDescription className="font-light">
                          Customize optimization behavior
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="tone-select" className="text-sm font-light">Tone</Label>
                          <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
                            <SelectTrigger id="tone-select" className="bg-background border-border font-light">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="professional" className="font-light">Professional</SelectItem>
                              <SelectItem value="casual" className="font-light">Casual</SelectItem>
                              <SelectItem value="technical" className="font-light">Technical</SelectItem>
                              <SelectItem value="creative" className="font-light">Creative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="detail-select" className="text-sm font-light">Detail Level</Label>
                          <Select value={detailLevel} onValueChange={(value) => setDetailLevel(value as DetailLevel)}>
                            <SelectTrigger id="detail-select" className="bg-background border-border font-light">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="concise" className="font-light">Concise</SelectItem>
                              <SelectItem value="balanced" className="font-light">Balanced</SelectItem>
                              <SelectItem value="comprehensive" className="font-light">Comprehensive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="format-select" className="text-sm font-light">Output Format</Label>
                          <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)}>
                            <SelectTrigger id="format-select" className="bg-background border-border font-light">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="structured" className="font-light">Structured</SelectItem>
                              <SelectItem value="narrative" className="font-light">Narrative</SelectItem>
                              <SelectItem value="bullet_points" className="font-light">Bullet Points</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    onClick={handleImprove} 
                    disabled={improveMutation.isPending || !originalPrompt.trim()}
                    className="w-full font-light"
                    variant="outline"
                  >
                    {improveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Optimize
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-light">Output</CardTitle>
                      <CardDescription className="font-light">
                        Optimized result
                      </CardDescription>
                    </div>
                    {improvedPrompt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(improvedPrompt)}
                        className="font-light"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {improvedPrompt ? (
                    <div className="prose prose-sm prose-invert max-w-none bg-background rounded-md p-4 min-h-[300px] max-h-[500px] overflow-y-auto border border-border">
                      <Streamdown>{improvedPrompt}</Streamdown>
                    </div>
                  ) : (
                    <div className="min-h-[300px] flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-md">
                      <div className="text-center space-y-2">
                        <Sparkles className="h-8 w-8 mx-auto opacity-30" />
                        <p className="text-sm font-light">Awaiting optimization</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
