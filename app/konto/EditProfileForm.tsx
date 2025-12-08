'use client'

import { StripePlan } from "@/utils/stripe/api";
import { User } from "@supabase/supabase-js";
import { useState } from "react";

interface AccountDataProps {
    user: User
    name: string
    plan: StripePlan
}

export default function EditProfileForm({ user, name }: AccountDataProps) {


    const [isEditing, setIsEditing] = useState(false);



    /*const [email, setEmail] = useState<string | undefined>(undefined);
    const [name, setName] = useState<string | undefined>(undefined);

    useEffect(() => {

        if (user) {
            setEmail(user.email);
            setName(ctxName!);
        }
    }, [user, ctxName]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setCtxName?.(name!);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEmail(user?.email ?? "");
        setName(ctxName ?? "");
        setIsEditing(false);
    };*/

    if (user) {
        return (
            <>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                            value={name}
                            disabled={!isEditing}
                        // onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                            value={user.email!}
                            disabled={!isEditing}
                        //onChange={e => setEmail(e.target.value)}
                        />
                    </div>


                </div>
            </>
        );
    }
}



/**


'use client'
import { Button } from "@/components/ui/button";
import useAppContext from "@/contexts/AppContext";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";


export default function EditProfileForm() {


    const [isEditing, setIsEditing] = useState(false);
    const { user, name: nameCtx, setName: setNameCtx, plan, loading } = useAppContext()


    const [email, setEmail] = useState(user?.email || "");
    const [name, setName] = useState(nameCtx || "");

    useEffect(() => {

        if (user) {
            setEmail(user.email!)
            setName(nameCtx!)
        }
    }, [nameCtx, user]);

    if (user && nameCtx) {
        return (
            <>
                <h2 className="text-lg font-semibold mb-2">Profile</h2>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                            value={name || ''}
                            disabled={!isEditing}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                            value={email || ""}
                            disabled={!isEditing}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button onClick={() => setIsEditing(false)}>Save</Button>
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        )}
                    </div>
                </div>
            </>
        )
    }
}


*/