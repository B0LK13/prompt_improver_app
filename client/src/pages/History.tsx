import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Streamdown } from 'streamdown';
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Trash2, Sparkles, Home as HomeIcon, Loader2, ArrowLeft } from "lucide-react";
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
      toast.success("Prompt deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete prompt: " + error.message);
    },
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Prompt History
              </h1>
              <p className="text-muted-foreground mt-2">
                View and manage all your improved prompts
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !prompts || prompts.length === 0 ? (
            <Card className="border-2">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No prompts yet</h3>
                    <p className="text-muted-foreground">
                      Start improving your prompts to see them here
                    </p>
                  </div>
                  <Link href="/">
                    <Button>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Your First Prompt
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">
                          {prompt.originalPrompt}
                        </CardTitle>
                        <CardDescription>
                          {new Date(prompt.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
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
                        >
                          View Details
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
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-lg p-4">
                      <div className="prose prose-sm max-w-none line-clamp-3">
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prompt Details</DialogTitle>
            <DialogDescription>
              Compare the original and improved versions
            </DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Original Prompt</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedPrompt.original)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm">{selectedPrompt.original}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Improved Prompt
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedPrompt.improved)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
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
