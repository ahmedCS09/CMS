import ViewMedRecordsDoc from "@/components/ViewMedRecordsDoc";
import Navbar from "@/components/Navbar";

export default function ViewMedRecordsDocPage() {
    return (
        <div className="min-h-screen bg-[#020617]">
            <Navbar />
            <main className="pt-24 pb-12">
                <ViewMedRecordsDoc />
            </main>
        </div>
    );
}
