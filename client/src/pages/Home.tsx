import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Streamdown } from 'streamdown';
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, ArrowRight, History, Loader2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  
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
    improveMutation.mutate({ originalPrompt });
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
              Enter your prompt below for detailed enhancement
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
                    <Label htmlFor="prompt-input" className="text-sm font-light">Prompt</Label>
                    <Textarea
                      id="prompt-input"
                      placeholder="Enter your prompt..."
                      value={originalPrompt}
                      onChange={(e) => setOriginalPrompt(e.target.value)}
                      className="min-h-[240px] resize-none bg-background border-border font-light"
                    />
                  </div>
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
                    <div className="prose prose-sm prose-invert max-w-none bg-background rounded-md p-4 min-h-[240px] max-h-[400px] overflow-y-auto border border-border">
                      <Streamdown>{improvedPrompt}</Streamdown>
                    </div>
                  ) : (
                    <div className="min-h-[240px] flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-md">
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

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-light">Optimization Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-sm">
                <div className="space-y-1">
                  <h4 className="font-medium">Specificity</h4>
                  <p className="text-muted-foreground font-light">
                    Include key details and requirements
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Context</h4>
                  <p className="text-muted-foreground font-light">
                    Provide relevant background information
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Objective</h4>
                  <p className="text-muted-foreground font-light">
                    Specify the desired output type
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Clarity</h4>
                  <p className="text-muted-foreground font-light">
                    Use clear, concise language
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
