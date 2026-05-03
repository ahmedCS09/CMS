import ForgotPassword from "@/components/ForgotPassword";

export const metadata = {
    title: "Forgot Password",
    description: "Forgot your password?",
    icons: {
        icon: "/auth.png",
    },
};

export default function ForgotPasswordPage() {
    return (
        <ForgotPassword />
    );
}
