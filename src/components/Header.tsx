import { Menu, Wrench } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white shadow-md relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenSidebar}
              className="p-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Wrench className="w-8 h-8 text-blue-100 hidden sm:block" />
              <span className="font-bold text-xl tracking-tight">Refaccionaria Especializada</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
