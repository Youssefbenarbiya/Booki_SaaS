import { notFound } from "next/navigation";
import { getCarById } from "../actions/carActions";
import { CarForm } from "../components/car-form";

interface CarEditPageProps {
  params: {
    id: string;
  };
}

export default async function CarEditPage({ params }: CarEditPageProps) {
  // Wait for params to be ready before accessing properties
  const { id: paramId } = await params;
  const id = parseInt(paramId);

  if (isNaN(id)) {
    notFound();
  }

  const { car } = await getCarById(id).catch(() => {
    notFound();
  });

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Edit Car</h2>
      <CarForm initialData={car} isEditing />
    </div>
  );
}
