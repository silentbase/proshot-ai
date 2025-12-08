"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface ScriptSetting {
    script_id: string;
    script_name: string;
    category: "essential" | "analytics" | "marketing";
    enabled: boolean;
    config: Record<string, any>;
}

// Generic script loader that creates script tags based on config
const loadGenericScript = (config: any) => {
    // Support for inline scripts
    if (config.inlineScript) {
        const script = document.createElement("script");
        if (config.type) script.type = config.type;
        if (config.async) script.async = true;
        if (config.defer) script.defer = true;
        script.innerHTML = config.inlineScript;
        document.head.appendChild(script);
    }

    // Support for external scripts
    if (config.src) {
        // Check if script already exists
        if (document.querySelector(`script[src="${config.src}"]`)) {
            return;
        }
        const script = document.createElement("script");
        script.src = config.src;
        if (config.async !== false) script.async = true; // Default to async
        if (config.defer) script.defer = true;
        if (config.type) script.type = config.type;
        if (config.crossOrigin) script.crossOrigin = config.crossOrigin;
        if (config.integrity) script.integrity = config.integrity;
        document.head.appendChild(script);
    }

    // Support for multiple scripts (array of scripts)
    if (config.scripts && Array.isArray(config.scripts)) {
        config.scripts.forEach((scriptConfig: any) => {
            loadGenericScript(scriptConfig);
        });
    }
};

export function useDynamicScripts() {
    const [scripts, setScripts] = useState<ScriptSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchScripts();

        // Subscribe to real-time changes
        const channel = supabase
            .channel("script-settings-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "script_settings" },
                () => {
                    fetchScripts();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchScripts = async () => {
        const { data, error } = await supabase
            .from("script_settings")
            .select("*")
            .eq("enabled", true);

        if (!error && data) {
            setScripts(data);
        }
        setLoading(false);
    };

    const loadScriptsBasedOnConsent = (acceptedCategories: string[]) => {
        scripts.forEach((script) => {
            if (acceptedCategories.includes(script.category)) {
                loadGenericScript(script.config);
            }
        });
    };

    return { scripts, loading, loadScriptsBasedOnConsent };
}
