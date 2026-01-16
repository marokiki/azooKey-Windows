import { Button } from "@/components/ui/button";
import { RefreshCcw, ExternalLink, Keyboard } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api/core';
import { toast } from "sonner";

const KEY_OPTIONS = [
    { value: "0x1D", label: "無変換 (NonConvert)" },
    { value: "0x1C", label: "変換 (Convert)" },
    { value: "0x1B", label: "Esc" },
    { value: "0x09", label: "Tab" },
    { value: "0x20", label: "Space" },
]

export const General = () => {
    const [version, setVersion] = useState("v0.1.0");
    const [keymap, setKeymap] = useState<Record<string, string>>({});

    // Load config
    useEffect(() => {
        invoke<any>("get_config").then((data) => {
            setVersion("v" + data.version);
            setKeymap(data.keymap || {});
        }).catch(console.error);
    }, []);

    const updateKeymap = async (newKeymap: Record<string, string>) => {
        try {
            const data = await invoke<any>("get_config");
            data.keymap = newKeymap;
            await invoke("update_config", { newConfig: data });
            setKeymap(newKeymap);
            toast("設定を保存しました");
        } catch (e) {
            toast.error("設定の保存に失敗しました");
        }
    }

    const setActionKey = (action: "Latin" | "Kana", key: string) => {
        const newKeymap = { ...keymap };

        // Remove existing keys mapping to this action
        Object.keys(newKeymap).forEach(k => {
            if (newKeymap[k] === action) delete newKeymap[k];
        });

        if (key && key !== "unassigned") {
            newKeymap[key] = action;
        }

        updateKeymap(newKeymap);
    };

    const getKeyForAction = (action: string) => {
        return Object.keys(keymap).find(key => keymap[key] === action) || "unassigned";
    };

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h1 className="text-sm font-bold text-foreground">バージョンと更新プログラム</h1>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <RefreshCcw />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {version}
                        </p>
                    </div>
                    <Button variant="secondary">
                        <a href="https://github.com/fkunn1326/azooKey-Windows/releases" className="flex items-center gap-x-2" target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                            更新を確認する
                        </a>
                    </Button>
                </div>
            </section>

            <section className="space-y-2">
                <h1 className="text-sm font-bold text-foreground">キー設定</h1>

                {/* Latin Input */}
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Keyboard />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            英語入力（Latin）に切り替え
                        </p>
                    </div>
                    <Select value={getKeyForAction("Latin")} onValueChange={(v) => setActionKey("Latin", v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="キーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">未設定</SelectItem>
                            {KEY_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Kana Input */}
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Keyboard />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            日本語入力（Kana）に切り替え
                        </p>
                    </div>
                    <Select value={getKeyForAction("Kana")} onValueChange={(v) => setActionKey("Kana", v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="キーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">未設定</SelectItem>
                            {KEY_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </section>
        </div>
    )
}
