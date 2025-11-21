import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Streamdown } from 'streamdown';
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Sparkles, ArrowRight, History, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  
  const improveMutation = trpc.prompt.improve.useMutation({
    onSuccess: (data) => {
      setImprovedPrompt(data.improvedPrompt);
      toast.success("Prompt improved successfully!");
    },
    onError: (error) => {
      toast.error("Failed to improve prompt: " + error.message);
    },
  });

  const handleImprove = () => {
    if (!originalPrompt.trim()) {
      toast.error("Please enter a prompt to improve");
      return;
    }
    improveMutation.mutate({ originalPrompt });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Transform your basic prompts into highly detailed, optimized instructions that produce superior AI results. 
                Perfect for text generation, image creation, code development, and more.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>AI-Powered Enhancement</CardTitle>
                  <CardDescription>
                    Advanced LLM technology analyzes and expands your prompts with context, structure, and clarity
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                    <ArrowRight className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle>Instant Results</CardTitle>
                  <CardDescription>
                    Get optimized prompts in seconds with detailed specifications, examples, and quality criteria
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <History className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>History & Management</CardTitle>
                  <CardDescription>
                    Save and access all your improved prompts with full history tracking and easy retrieval
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="pt-8">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <a href={getLoginUrl()}>
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Improve Your Prompts
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your basic prompt below and watch it transform into a detailed, optimized version
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Original Prompt
                </CardTitle>
                <CardDescription>
                  Enter your basic prompt or idea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: Create a website for a coffee shop"
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <Button 
                  onClick={handleImprove} 
                  disabled={improveMutation.isPending || !originalPrompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {improveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Improve Prompt
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Improved Prompt
                  </span>
                  {improvedPrompt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(improvedPrompt)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your optimized, detailed prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                {improvedPrompt ? (
                  <div className="prose prose-sm max-w-none bg-white rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <Streamdown>{improvedPrompt}</Streamdown>
                  </div>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center text-muted-foreground text-center p-8">
                    <div className="space-y-2">
                      <Sparkles className="h-12 w-12 mx-auto opacity-20" />
                      <p>Your improved prompt will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2">
            <CardHeader>
              <CardTitle>💡 Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Be Specific</h4>
                <p className="text-sm text-muted-foreground">
                  Include key details about what you want to create or achieve
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Mention Your Goal</h4>
                <p className="text-sm text-muted-foreground">
                  Specify the type of output: text, image, code, or data analysis
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Add Context</h4>
                <p className="text-sm text-muted-foreground">
                  Provide background information or constraints if relevant
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Keep It Clear</h4>
                <p className="text-sm text-muted-foreground">
                  Use simple language - the AI will add the complexity
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
