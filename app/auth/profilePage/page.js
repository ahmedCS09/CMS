import Profile from "@/components/profile";
import { Suspense } from "react";

export const metadata = {
  title: "Your Profile",
  description: "View and update your profile",
  icons: {
    icon: "/profile.png",
  },
};

export default function profilePage() {

  return (
    <Suspense fallback={
      <div className="w-full pt-32 pb-24 flex justify-center items-start px-4">
        <div className="w-20 h-20 border-4 border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <Profile />
    </Suspense>
  );
}