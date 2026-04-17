
import { ProductGrid } from './ProductGrid';

interface ProductosViewProps {
  isAuthenticated: boolean;
  userRole: 'admin' | 'empleado' | 'usuario' | null;
  userId?: string;
  onRequireLogin: () => void;
}

export function ProductosView({ isAuthenticated, userRole, userId, onRequireLogin }: ProductosViewProps) {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8 w-full max-w-4xl mx-auto overflow-hidden relative h-[50px] sm:h-[70px] lg:h-[90px] shadow-sm bg-transparent rounded-2xl">
        <img
          src="/productos.png"
          alt="Productos Banner"
          className="absolute inset-0 w-full h-full object-cover object-center drop-shadow-sm"
        />
      </div>

      <ProductGrid
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userId={userId}
        onRequireLogin={onRequireLogin}
        showAdvancedFilters={true}
        limit={24}
      />
    </div>
  );
}
