import Login from "@/components/Login.js";

export const metadata = {
  title: "Login",
  description: "Login to your account",
  icons: {
    icon: "/auth.png",
  },
};

export default function LoginPage() {
  return (
    <>
      <Login />
    </>
  );
}