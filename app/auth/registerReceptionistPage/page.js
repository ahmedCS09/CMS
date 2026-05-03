import RegisterReceptionist from "@/components/RegisterReceptionist.js";

export const metadata = {
    title: "Register Receptionist",
    description: "Register a new receptionist into the system",
    icons: {
        icon: "/auth.png",
    },
};

export default function RegisterReceptionistPage() {
    return (
        <RegisterReceptionist />
    );
}