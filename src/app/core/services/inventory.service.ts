import { Injectable, signal, effect } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  category: 'medicine' | 'food' | 'accessory';
  price: number;
  stock: number;
  minStock: number;
  image?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private products = signal<Product[]>([
    { 
      id: 'm1', 
      name: 'Bravecto Antipulgas y Garrapatas', 
      category: 'medicine', 
      price: 105.0, 
      stock: 25, 
      minStock: 5, 
      image: 'https://gopet.vtexassets.com/arquivos/ids/176618/20190238_1.jpg?v=639080661192630000',
      description: 'Protección efectiva por 12 semanas contra pulgas y garrapatas. Una sola tableta masticable que a tu perro le encantará.'
    },
    { 
      id: 'm2', 
      name: 'NexGard Spectra (2-3.5kg)', 
      category: 'medicine', 
      price: 112.50, 
      stock: 12, 
      minStock: 3, 
      image: 'https://mascotify.pe/wp-content/uploads/2020/10/NEXGARD-SPECTRA-2kg-a-3-5kg-Antipulgas-y-antiparasitario.png',
      description: 'Tratamiento completo contra parásitos externos e internos. Ideal para perros de raza pequeña.'
    },
    { 
      id: 'm3', 
      name: 'Apoquel 16mg (20 Tab)', 
      category: 'medicine', 
      price: 234.90, 
      stock: 8, 
      minStock: 2, 
      image: 'https://farmaciaveterinaria.pe/wp-content/uploads/2024/05/CCCCCCC.jpg',
      description: 'Tratamiento de acción rápida para el control del prurito (picazón) asociado con dermatitis alérgica.'
    },
    { 
      id: 'm4', 
      name: 'Cicativet Pomada Cicatrizante', 
      category: 'medicine', 
      price: 32.50, 
      stock: 15, 
      minStock: 5, 
      image: 'https://petsland.pe/wp-content/uploads/2025/12/509-2.webp',
      description: 'Pomada eficaz para la cicatrización de heridas, quemaduras y lesiones en la piel de tu mascota.'
    },
    
    { 
      id: 'a1', 
      name: 'Canbo Adulto Cordero 15kg', 
      category: 'food', 
      price: 245.0, 
      stock: 10, 
      minStock: 2, 
      image: 'https://gezanipe.vtexassets.com/arquivos/ids/172375-800-auto?v=639074661480270000&width=800&height=auto&aspect=true',
      description: 'Alimento premium a base de cordero para perros adultos. Mejora la digestión y mantiene el pelaje brillante.'
    },
    { 
      id: 'a2', 
      name: 'Ricocan Adulto Carne y Cereales 15kg', 
      category: 'food', 
      price: 135.0, 
      stock: 15, 
      minStock: 5, 
      image: 'https://wongfood.vtexassets.com/arquivos/ids/371273-800-auto?v=637312320648000000&width=800&height=auto&aspect=true',
      description: 'Nutrición balanceada con el delicioso sabor de la carne. Proteínas de alta calidad para una vida activa.'
    },
    { 
      id: 'a3', 
      name: 'Pro Plan Adulto Razas Pequeñas 3kg', 
      category: 'food', 
      price: 95.0, 
      stock: 20, 
      minStock: 8, 
      image: 'https://www.superpet.pe/on/demandware.static/-/Sites-SuperPet-master-catalog/default/dw8d970d0b/images/pro-plan-adulto-razas-pequenas-3kg.jpg',
      description: 'Fórmula avanzada diseñada específicamente para las necesidades metabólicas de perros miniatura y pequeños.'
    },
    { 
      id: 'a4', 
      name: 'Dog Chow Cachorro Cordero 8kg', 
      category: 'food', 
      price: 85.0, 
      stock: 18, 
      minStock: 4, 
      image: 'https://wongfood.vtexassets.com/arquivos/ids/715883-800-auto?v=638566834454670000&width=800&height=auto&aspect=true',
      description: 'Ayuda al desarrollo saludable del cerebro y la visión de tu cachorro con proteínas de cordero.'
    },

    { 
      id: 'j1', 
      name: 'Mordedor KONG Classic Medio', 
      category: 'accessory', 
      price: 55.0, 
      stock: 14, 
      minStock: 3, 
      image: 'https://patitasco.com/6896-large_default/kong-mordedor-classic-pequeno-color-rojo-perros.jpg',
      description: 'El estándar de oro de los juguetes para perros. Duradero, rebota de forma impredecible y se puede rellenar con premios.'
    },
    { 
      id: 'j2', 
      name: 'Pelota Chuckit! Ultra Ball', 
      category: 'accessory', 
      price: 35.0, 
      stock: 22, 
      minStock: 5, 
      image: 'https://mascotaveloz.pe/wp-content/uploads/2020/02/MV000238_1-1.jpg',
      description: 'Diseñada para el juego de búsqueda más exigente. Alta visibilidad, gran rebote y flota en el agua.'
    },
    { 
      id: 'j3', 
      name: 'Peluche con Chifle Animal Planet', 
      category: 'accessory', 
      price: 25.0, 
      stock: 30, 
      minStock: 5, 
      image: 'https://http2.mlstatic.com/D_NQ_NP_939427-MLA54959391381_042023-O.webp',
      description: 'Compañero suave y divertido para tu mascota. Incluye un chifle interno que estimula el instinto de juego.'
    },
    { 
      id: 'j4', 
      name: 'Túnel para Gatos con Juguete', 
      category: 'accessory', 
      price: 45.0, 
      stock: 10, 
      minStock: 2, 
      image: 'https://m.media-amazon.com/images/I/714BN0Jy0wS._AC_SL1500_.jpg',
      description: 'Espacio perfecto para que tu gato explore y juegue. Plegable para un fácil almacenamiento.'
    },
  ]);

  constructor() {
    const saved = localStorage.getItem('vet_inventory');
    if (saved) {
      try { this.products.set(JSON.parse(saved)); } catch (e) {}
    }
    
    effect(() => {
      localStorage.setItem('vet_inventory', JSON.stringify(this.products()));
    });
  }

  getProducts() {
    return this.products;
  }

  updateStock(id: string, newStock: number) {
    this.products.update(prev => 
      prev.map(p => p.id === id ? { ...p, stock: newStock } : p)
    );
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct = { ...product, id: Math.random().toString(36).substring(7) };
    this.products.update(prev => [...prev, newProduct]);
  }

  deleteProduct(id: string) {
    this.products.update(prev => prev.filter(p => p.id !== id));
  }
}
