import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="px-4 md:px-8 py-20 max-w-5xl mx-auto flex flex-col items-center justify-center gap-3 text-[var(--foreground)]/50">
      <Spinner size={32} />
      <span className="text-sm font-medium">Cargando articulo...</span>
    </div>
  );
}
