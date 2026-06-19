export function Logo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <img 
      src="/icon.svg" 
      alt="GeoDrafts Logo" 
      className={`rounded-full object-cover ${className}`}
    />
  );
}
