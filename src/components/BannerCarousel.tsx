import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Layout } from 'lucide-react';

interface Banner {
  id: string;
  url: string;
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_banners')
        .single();

      if (!error && data?.value) {
        setBanners(data.value as Banner[]);
      }
    } catch (err) {
      console.error('Error fetching carousel banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="mb-10 max-w-4xl mx-auto w-full h-[150px] sm:h-[250px] lg:h-[350px] bg-gray-100 animate-pulse rounded-2xl border border-gray-100"></div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="mb-10 max-w-4xl mx-auto w-full overflow-hidden bg-gradient-to-r from-amber-500 to-[#fdc401] rounded-[2.5rem] p-12 text-center shadow-xl shadow-amber-100 border-4 border-white">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 text-white border border-white/30">
            <Layout className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-sm">
            Bienvenido a Refaccionaria Cordobesa
          </h2>
          <p className="text-amber-950 font-bold opacity-80 leading-relaxed">
            Estamos preparando nuevas promociones para ti. ¡Vuelve pronto para ver nuestras ofertas exclusivas en refaccionaria industrial!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 max-w-4xl mx-auto w-full group relative">
      <div className="relative w-full overflow-hidden shadow-sm border border-gray-100">
        {/* Usamos una imagen invisible para mantener la altura automática del contenedor basada en el aspecto de la imagen */}
        <img
          src={banners[0].url}
          alt=""
          className="w-full h-auto opacity-0 pointer-events-none"
        />
        
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.url}
              alt=""
              className="w-full h-full object-contain hover:opacity-95 transition-opacity cursor-pointer"
            />
          </div>
        ))}

      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-3 mt-4 animate-in fade-in duration-700">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                index === currentIndex 
                  ? 'bg-[#fdc401] border-[#fdc401] scale-125 shadow-sm' 
                  : 'bg-transparent border-gray-300 hover:border-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
