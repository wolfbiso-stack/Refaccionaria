import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Product {
    id: string;
    name: string;
    brand?: string;
    sku?: string;
    slug?: string;
    description: string;
    stock: number;
    image_url: string;
    images?: string[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    showToast: boolean;
    setShowToast: (show: boolean) => void;
    lastAddedProduct: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Cargar carrito inicial desde localStorage
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('refaccionaria_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [showToast, setShowToast] = useState(false);
    const [lastAddedProduct, setLastAddedProduct] = useState<string | null>(null);

    // Guardar carrito en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('refaccionaria_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });

        // Mostrar notificación (toast)
        setLastAddedProduct(product.name);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            showToast,
            setShowToast,
            lastAddedProduct
        }}>
            {children}
        </CartContext.Provider>
    );
};
