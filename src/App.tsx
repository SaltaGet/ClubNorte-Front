import { useEffect, useState } from "react";
import RoutesWeb from "./routes/RoutesWeb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const App = () => {
  const [showReloadDialog, setShowReloadDialog] = useState(false);

  useEffect(() => {
    // Interceptar atajos de teclado para recargar
    const handleKeyDown = (e: KeyboardEvent) => {
      // F5 o Ctrl+R o Cmd+R
      if (
        e.key === 'F5' || 
        (e.key === 'r' && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        setShowReloadDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleConfirmReload = () => {
    window.location.reload();
  };

  const handleCancelReload = () => {
    setShowReloadDialog(false);
  };

  return (
    <>
      <div className="min-h-screen">
        <RoutesWeb />
        
      </div>

      <AlertDialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">
              ¿Recargar página?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              ¿Estás seguro que deseas recargar la página? Los cambios no guardados se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelReload}
              className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReload}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Sí, recargar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default App;