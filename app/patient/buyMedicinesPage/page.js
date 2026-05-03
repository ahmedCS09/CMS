import BuyMedicines from "@/components/BuyMedicines";

export const metadata = {
    title: "Buy Medicines",
    description: "Buy medicines",
    icons: {
        icon: "/medicine.png",
    },
};

export default function BuyMedicinesPage() {
    return (
        <BuyMedicines />
    );
}