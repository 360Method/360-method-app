import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-6 bg-white p-8 md:p-12 rounded-2xl shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome to 360° Method
        </h1>
        
        <p className="text-xl text-gray-700">
          Your home protection command center
        </p>
        
        <Button 
          size="lg"
          onClick={() => navigate('/dashboard', { replace: true })}
          className="gap-2"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}