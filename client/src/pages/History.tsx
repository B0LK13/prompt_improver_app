import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Streamdown } from 'streamdown';
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Trash2, Home as HomeIcon, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [selectedPrompt, setSelectedPrompt] = useState<{ original: string; improved: string } | null>(null);
  
  const { data: prompts, isLoading, refetch } = trpc.prompt.list.useQuery(undefined, {
    enabled: !!user,
  });

  const deleteMutation = trpc.prompt.delete.useMutation({
    onSuccess: () => {
      toast.success("Prompt deleted");
      refetch();
    },
    onError: (error) => {
      toast.error("Delete failed: " + error.message);
    },
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this prompt?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}} />
      </div>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium tracking-wide">{APP_TITLE}</h1>
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="font-light hover:bg-white/10">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-16 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="font-light glass border-white/10 hover:border-white/20 hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-4xl font-bold tracking-tight gradient-text">History</h2>
              <p className="text-muted-foreground mt-2 font-light text-lg">
                All optimized prompts
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
          ) : !prompts || prompts.length === 0 ? (
            <Card className="glass-strong border-white/20 rounded-2xl">
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <div className="text-4xl font-light text-muted-foreground">—</div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-light">No prompts yet</h3>
                    <p className="text-muted-foreground text-sm font-light">
                      Start optimizing prompts to build your history
                    </p>
                  </div>
                  <Link href="/">
                    <Button variant="outline" className="font-light mt-4 glass border-white/20 hover:border-white/40 hover:bg-white/10">
                      Create Prompt
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="glass-strong border-white/20 rounded-2xl hover:border-white/40 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <CardTitle className="text-base font-light line-clamp-2">
                          {prompt.originalPrompt}
                        </CardTitle>
                        <CardDescription className="font-light space-y-1">
                          <div>
                            {new Date(prompt.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {prompt.templateType && (
                            <div className="text-xs">
                              Template: {prompt.templateType}
                              {prompt.tone && ` • ${prompt.tone}`}
                              {prompt.detailLevel && ` • ${prompt.detailLevel}`}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPrompt({
                            original: prompt.originalPrompt,
                            improved: prompt.improvedPrompt,
                          })}
                          className="font-light glass border-white/10 hover:border-white/20 hover:bg-white/10"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(prompt.improvedPrompt)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(prompt.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="glass rounded-lg p-4 border border-white/10">
                      <div className="prose prose-sm prose-invert max-w-none line-clamp-3">
                        <Streamdown>{prompt.improvedPrompt}</Streamdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedPrompt} onOpenChange={(open) => !open && setSelectedPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto glass-strong border-white/20">
          <DialogHeader>
            <DialogTitle className="font-light">Prompt Details</DialogTitle>
            <DialogDescription className="font-light">
              Original and optimized versions
            </DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Original</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedPrompt.original)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="glass rounded-lg p-4 border border-white/10">
                  <p className="text-sm font-light">{selectedPrompt.original}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Optimized</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedPrompt.improved)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="glass rounded-lg p-4 border border-white/10">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <Streamdown>{selectedPrompt.improved}</Streamdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
