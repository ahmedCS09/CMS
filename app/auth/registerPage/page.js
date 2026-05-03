import Register from "@/components/Register.js";

export const metadata = {
  title: "Register",
  description: "Register for an account",
  icons: {
    icon: "/auth.png",
  },
};

export default function RegisterPage() {
    return (
        <Register />
    );
}