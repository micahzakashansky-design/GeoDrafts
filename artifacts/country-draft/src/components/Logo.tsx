export function Logo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <img 
      src="/favicon.svg" 
      alt="GeoDrafts Logo" 
      className={`dark:invert ${className}`} 
    />
  );
}
