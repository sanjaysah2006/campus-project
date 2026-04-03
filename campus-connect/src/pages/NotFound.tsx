import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6"
      >
        <h1 className="text-6xl font-bold text-primary">404</h1>

        <p className="text-xl text-muted-foreground">
          Oops! The page you're looking for doesn't exist.
        </p>

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Attempted route:{" "}
          <span className="font-mono">{location.pathname}</span>
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
