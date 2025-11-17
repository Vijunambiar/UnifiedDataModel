import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-300">404</h1>
        <p className="mt-2 text-muted-foreground">This page does not exist.</p>
        <a href="/" className="mt-4 inline-block text-sm font-medium underline">Return to Home</a>
      </div>
    </div>
  );
};

export default NotFound;
