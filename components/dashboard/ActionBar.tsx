import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

interface ActionBarProps {
    status: "ready" | "generating" | "completed" | "error";
    onGenerate: () => void;
    onSave?: () => void;
    onExport?: () => void;
    canGenerate?: boolean;
    hasResults?: boolean;
}

export function ActionBar({
    status,
    onGenerate,
    onSave,
    onExport,
    canGenerate = false,
    hasResults = false
}: ActionBarProps) {
    const getStatusDisplay = () => {
        switch (status) {
            case "generating":
                return (
                    <Badge variant="secondary" className="gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Wird generiert...
                    </Badge>
                );
            case "completed":
                return (
                    <Badge variant="default" className="gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Abgeschlossen
                    </Badge>
                );
            case "error":
                return (
                    <Badge variant="destructive" className="gap-2">
                        <span className="w-2 h-2 bg-red-700 rounded-full" />
                        Fehler
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Bereit
                    </Badge>
                );
        }
    };

    return (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-border p-6">
            <div className="container mx-auto max-w-4xl">
                <div className="flex items-center justify-center gap-8">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        {getStatusDisplay()}
                    </div>

                    {/* Main Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            size="lg"
                            onClick={onGenerate}
                            disabled={!canGenerate || status === "generating"}
                            className={`px-8 shimmer-on-hover" ${status === "generating" ? 'hidden' : ''}`}
                        >
                            {status === "generating" ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Wird generiert...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generieren
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}