import { X, Clock } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-4 px-2 space-y-1">
          {[1, 2, 3, 4, 5].map((item) => (
            <div 
              key={item} 
              className="flex items-center px-4 py-3 text-sm font-black text-gray-400 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-all cursor-pointer group"
            >
              <Clock className="mr-3 w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
              Opción {item} (Próximamente)
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
