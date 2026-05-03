import ViewAppointmentsDoc from "@/components/ViewAppointmentsDoc";

export const metadata = {
    title: "View Appointments",
    description: "View your scheduled appointments.",
    icons: {
        icon: "/doctor.png",
    },
};

export default function Page() {
    return (
        <ViewAppointmentsDoc />
    );
}