export function Logo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <img 
      src="/logo.svg" 
      alt="GeoDrafts Logo" 
      className={`rounded-full object-cover ${className}`}
    />
  );
}
