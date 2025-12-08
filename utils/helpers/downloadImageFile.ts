import { toast } from "sonner";

const downloadImageFile = async (imageUrl: string, filename: string) => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        toast.success("Bild erfolgreich heruntergeladen!");
    } catch (error) {
        console.error("Download error:", error);
        toast.error("Bild konnte nicht heruntergeladen werden");
    }
};

export default downloadImageFile;
