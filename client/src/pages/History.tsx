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
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-light tracking-wide">{APP_TITLE}</h1>
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="font-light">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="font-light">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-light tracking-tight">History</h2>
              <p className="text-muted-foreground mt-1 font-light">
                All optimized prompts
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
          ) : !prompts || prompts.length === 0 ? (
            <Card className="bg-card border-border">
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
                    <Button variant="outline" className="font-light mt-4">
                      Create Prompt
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="bg-card border-border hover:border-foreground/20 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <CardTitle className="text-base font-light line-clamp-2">
                          {prompt.originalPrompt}
                        </CardTitle>
                        <CardDescription className="font-light">
                          {new Date(prompt.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                          className="font-light"
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
                    <div className="bg-background rounded-md p-4 border border-border">
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border">
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
                <div className="bg-background rounded-md p-4 border border-border">
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
                <div className="bg-background rounded-md p-4 border border-border">
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
