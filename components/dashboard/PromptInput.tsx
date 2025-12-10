import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shuffle, X, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    errorMsg?: string | null
}
const randomPrompts = [
    // Person + Produkt
    "erstelle ein Bild, in dem die Person das angegebene Produkt hält. Ersetze den Hintergrund durch eine helle, sonnige Parkszene mit weichem Bokeh.",
    "erstelle ein Bild, in dem die Person das angegebene Produkt hält. Ersetze den Hintergrund durch ein luxuriöses Badezimmer mit Naturstein-Texturen.",
    "erstelle ein Bild, in dem die Person das angegebene Produkt hält. Ersetze den Hintergrund durch ein graues Premium-Studio mit feinen Lichtverläufen und edler Minimal-Ästhetik, ideal für Kosmetik & Supplements",
    "erstelle ein Bild, in dem die Person sitzend auf einem modernen Designer-Stuhl das angegebene Produkt hält. Ersetze den Hintergrund durch ein helles, minimalistisches Studio mit weichen Schatten und klarer Premium-Ästhetik.",
    "erstelle ein Bild, in dem die Person das angegebene Produkt hält. Ersetze den Hintergrund durch eine elegante Indoor-Szene mit natürlichem Fensterlicht.",
    "erstelle ein Bild, in dem die Person das angegebene Produkt hält. Ersetze den Hintergrund durch eine helle Stadt-Szene mit unscharfem Bokeh.",
    "erstelle ein Bild, in dem die Person das angegebene Produkt hält. Ersetze den Hintergrund durch eine helle Strandszene mit warmem Sonnenlicht, leichtem Wind in den Haaren und sanften, natürlichen Reflexionen.",
    "erstelle ein Bild, in dem die Person das angegebene Produkt hält. Ersetze den Hintergrund durch eine naturbelassene Wasserfall-Szene mit frischem Nebel, Sonnenstrahlen und lebendigen Farben.",
    "erstelle ein Bild, in dem die Person das angegebene Produkt hochhält. Ersetze den Hintergrund durch eine Rooftop-Szene während der Golden Hour, mit warmem Licht, Atmosphäre und professionellen Werbe-Vibes.",

    // Nur Produkt, dynamische/Marketing-Hintergründe
    "erstelle ein atemberaubendes Produktfoto. Ersetze den Hintergrund durch einen luxuriösen weißen Studiohintergrund mit weichen Schatten.",
    "erstelle ein Produkt auf einem pastellfarbenen Hintergrund mit sanftem Licht und eleganten Reflexionen.",
    "erstelle ein Produkt, das gerade auf die Wasseroberfläche trifft, mit einem kraftvollen Splash-Effekt, klaren Tropfen und dynamischen Reflexionen, als hochwertiges Werbeshooting.",
    "erstelle ein Produkt, das diagonal über eine reflektierende Glasfläche fällt, mit Motion-Blur und Fokus auf dem Produkt.",
    "erstelle ein Produkt auf einem futuristischen Neon-Hintergrund mit reflektierenden Linien und markanten Schatten.",
    "erstelle ein Produkt auf einem minimalistischen weißen Podest mit weichen Schatten und hochwertiger Studiobeleuchtung.",
    "erstelle ein Produkt auf einem hellen Outdoor-Hintergrund mit weichem Sonnenlicht und Bokeh.",
    "erstelle ein Produkt, das auf einem stilvollen Holztisch liegt, umgeben von frischem, farbenfrohem Obst, natürlichem Fensterlicht und professioneller Food-Photography-Ästhetik.",
    "erstelle ein Produkt auf einem reflektierenden Glasboden mit Softlight-Effekten.",
    "erstelle ein Produkt unter Wasser, umgeben von sanften Lichtstrahlen, glänzenden Wasserreflexen und feinen Luftblasen, für einen edlen, glossy Marketing-Look.",
    "erstelle ein Produkt, das leicht in der Luft fällt, mit Motion-Blur und Fokus auf dem Produkt.",
    "erstelle ein Produkt, das dynamisch vom Himmel fällt, mit realistischen Wolken, leichter Motion-Blur-Bewegung und einem hochwertigen Werbe-Look.",
    "erstelle ein Produkt auf einem luxuriösen Marmortisch mit sanftem Licht und eleganten Schatten."
];


const negativePrompts = [
    "blurry", "low quality", "distorted", "oversaturated", "cluttered",
    "dark", "grainy", "pixelated", "artifacts"
];


const helperPrompts = [
    {
        category: "Originalhaltung behalten",
        prompts: [
            "Die Haltung der Person soll exakt wie im Referenzbild bleiben.",
            "Die Handposition und der Griff des Produkts müssen identisch mit der Referenz bleiben.",
            "Die Proportionen und Pose der Person dürfen nicht verändert werden."
        ]
    },
    {
        category: "Haltung darf angepasst werden",
        prompts: [
            "Die Haltung der Person soll leicht angepasst werden, solange das Produkt korrekt präsentiert wird.",
            "Die Person hat eine ganz andere haltung, passend zu dem neu erstellten Bild",
            "Die Körperhaltung soll dynamischer gestaltet werden, muss aber natürlich wirken."
        ]
    },
    {
        category: "Person nicht verändern",
        prompts: [
            "Das Erscheinungsbild der Person (Gesicht, Körperform, Kleidung) darf nicht verändert werden.",
            "Keine neuen Accessoires, keine neuen Objekte und keine neue Kleidung hinzufügen."
        ]
    },
    {
        category: "Hintergrund ersetzen",
        prompts: [
            "Ersetze den kompletten Hintergrund durch den angegebenen neuen Hintergrund.",
            "Der ursprüngliche Hintergrund darf nicht sichtbar bleiben.",
            "Hintergründe mehrerer Bilder dürfen unter keinen Umständen miteinander vermischt werden."
        ]
    },
    {
        category: "Hintergrund behalten",
        prompts: [
            "Der Hintergrund aus dem Originalbild soll vollständig erhalten bleiben.",
            "Keine Hintergrundänderung durchführen, nur Bildqualität verbessern."
        ]
    },
    {
        category: "Sonstiges",
        prompts: [
            "Nur das Produkt ist zu sehen. Keine Personen sind zusehen.",
            "Nur das Produkt soll dargestellt werden. Keine Interaktion mit Personen oder Händen.",
            "Füge dem Produkt keine zusätzlichen Effekte wie Glow, Schimmer, Funkeln, Glanzränder oder künstliche Highlights hinzu. Das Produkt soll vollständig natürlich und realistisch wirken."
        ]
    }

];

export function PromptInput({ value, onChange, placeholder, disabled, errorMsg }: PromptInputProps) {
    const [negativeTags, setNegativeTags] = useState<string[]>([]);
    const [showNegativeInput, setShowNegativeInput] = useState(false);

    const randomizePrompt = () => {
        const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
        //const newValue = value ? `${value} ${randomPrompt}` : randomPrompt;
        onChange(randomPrompt);
    };

    const addNegativeTag = (tag: string) => {
        if (!negativeTags.includes(tag)) {
            setNegativeTags([...negativeTags, tag]);
        }
    };

    const removeNegativeTag = (tag: string) => {
        setNegativeTags(negativeTags.filter(t => t !== tag));
    };

    const addHelperPrompt = (prompt: string) => {
        const newValue = value ? `${value} ${prompt}` : prompt;
        onChange(newValue);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    {/* <label className="text-sm font-medium text-foreground">
                        Describe your photo
                    </label>*/}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={randomizePrompt}
                            disabled={disabled}
                        >
                            <Shuffle className="h-4 w-4 mr-2" />
                            Zufällig
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={disabled}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ergänzende Text-Prompts
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="center"
                                side="bottom"
                                className="w-[50vw] max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50"
                                sideOffset={5}
                            >
                                <div className="px-2 py-1.5 text-sm font-semibold text-center border-b">
                                    Ergänzende Prompts zur Optimierung
                                </div>
                                {helperPrompts.map((section, sectionIndex) => (
                                    <div key={sectionIndex}>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-sm font-bold text-foreground">
                                            {section.category}
                                        </DropdownMenuLabel>
                                        {section.prompts.map((prompt, promptIndex) => (
                                            <DropdownMenuItem
                                                key={promptIndex}
                                                onClick={() => addHelperPrompt(prompt)}
                                                className="text-sm cursor-pointer whitespace-normal py-2 text-foreground/80"
                                            >
                                                {prompt}
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Beschreiben Sie den Hintergrund und Stil..."}
                    className="min-h-[100px] resize-none"
                    disabled={disabled}
                />
                {errorMsg && <div className="text-sm text-red-500 mt-2">{errorMsg}</div>}
            </div>

            {/*<div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Dinge die Sie nicht möchten</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNegativeInput(!showNegativeInput)}
                        disabled={disabled}
                    >
                        {showNegativeInput ? "Ausblenden" : "Hinzufügen"}
                    </Button>
                </div>

                {showNegativeInput && (
                    <div className="flex flex-wrap gap-2">
                        {negativePrompts.map((tag) => (
                            <Badge
                                key={tag}
                                variant={negativeTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() =>
                                    negativeTags.includes(tag)
                                        ? removeNegativeTag(tag)
                                        : addNegativeTag(tag)
                                }
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {negativeTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {negativeTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                                {tag}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => removeNegativeTag(tag)}
                                />
                            </Badge>
                        ))}
                    </div>
                )}
            </div>*/}
        </div>
    );
}