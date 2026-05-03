import Patient from "@/components/Patient";

export const metadata = {
    title: "Patient",
    description: "Patient Page",
    icons: {
        icon: "/patient.png",
    },
}

export default function PatientPage() {
    return (
        <Patient />
    )
}
