import React from 'react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="text-[#4A5D23] font-bold tracking-widest uppercase text-sm mb-4 block">Nuestra Historia</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">Home Tropicâlia</h1>

                    <div className="w-20 h-1.5 bg-[#4A5D23] mx-auto mb-10 rounded-full"></div>

                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium italic">
                        "We are a Colombian couple in love with cooking and homemade flavors; we bring authentic, flavorful, homemade food to your table, made with love to continue delighting the taste buds of our community."
                    </p>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div className="p-8 bg-gray-50 rounded-[2.5rem]">
                            <h3 className="text-xl font-bold text-[#4A5D23] mb-4">Misión</h3>
                            <p className="text-gray-600">Reconectar a nuestra comunidad con sus raíces a través de la gastronomía auténtica y artesanal.</p>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-[2.5rem]">
                            <h3 className="text-xl font-bold text-[#4A5D23] mb-4">Pasión</h3>
                            <p className="text-gray-600">Cada plato es una obra de arte culinaria, preparada con ingredientes de la más alta calidad y un toque de amor familiar.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
