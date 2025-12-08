export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] space-y-4">
            <div className="animate-spin h-10 w-10 rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
    )
}
