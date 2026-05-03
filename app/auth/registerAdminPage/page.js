import RegisterAdmin from "@/components/RegisterAdmin.js";

export const metadata = {
  title: "Register",
  description: "Register for an account",
  icons: {
    icon: "/auth.png",
  },
};

export default function RegisterAdminPage() {
  return (
    <>
      <RegisterAdmin />
    </>
  );
}