import { Button } from "@/components/ui/button";
import { CarsTable } from "./components/cars-table";
import { columns } from "./components/columns";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getCars } from "./actions/carActions";

export default async function CarsPage() {
  const { cars } = await getCars();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Cars Management</h2>
        <Button asChild>
          <Link href="/admin/dashboard/cars/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Car
          </Link>
        </Button>
      </div>

      <CarsTable columns={columns} data={cars} />
    </div>
  );
}
