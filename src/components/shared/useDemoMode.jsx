import { useLocation } from "react-router-dom";

export function useDemoMode() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isDemoMode = params.get('demo') === 'true';
  
  return isDemoMode;
}