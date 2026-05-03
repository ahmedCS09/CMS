import ViewMedRecords from "@/components/ViewMedRecords";

export const metadata = {
    title: "View Medical Records",
    description: "View your medical records",
    icons: {
        icon: "/patient.png",
    },
};

export default function ViewMedRecordsPage() {
    return (
        <ViewMedRecords />
    );
}