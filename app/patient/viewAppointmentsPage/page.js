import ViewAppointments from "@/components/ViewAppointments";

export const metadata = {
    title: "View Appointments",
    description: "View your appointments",
    icons: {
        icon: "/patient.png",
    },
};

export default function ViewAppointmentsPage() {
    return (
        <ViewAppointments />
    );
}
