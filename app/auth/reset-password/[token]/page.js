import ResetPassword from "@/components/ResetPassword";

export const metadata = {
    title: "Reset Password",
    description: "Reset your password",
    icons: {
        icon: "/auth.png",
    },
};

export default async function ResetPasswordPage({ params }) {
    const { token } = await params;
    return (
        <ResetPassword token={token} />
    );
}
