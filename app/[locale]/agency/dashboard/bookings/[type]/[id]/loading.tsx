export default function Loading() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading booking details...</p>
      </div>
    </div>
  );
} 