import Appointments from "@/components/Appointments";

export const metadata = {
    title: "Appointments",
    description: "View and manage appointments",
    icons: {
        icon: "/receptionist.png",
    },
};

export default function Page() {
    return (
        <Appointments />
    );
}