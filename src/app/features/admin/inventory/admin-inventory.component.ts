import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, Product } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight">Gestión de Inventario</h1>
          <p class="text-gray-500 font-medium">Control de stock, medicamentos y suministros</p>
        </div>
        <button (click)="showAddModal.set(true)" class="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
          Nuevo Producto
        </button>
      </div>

      @if(lowStockProducts().length > 0) {
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 animate-bounce-subtle">
          <div class="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <p class="text-amber-800 font-bold">Atención: Hay {{ lowStockProducts().length }} productos con stock bajo.</p>
        </div>
      }

      <div class="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Producto</th>
              <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Categoría</th>
              <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Precio</th>
              <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Stock actual</th>
              <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for(product of inventoryService.getProducts()(); track product.id) {
              <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-black">
                      {{ product.name[0] }}
                    </div>
                    <span class="font-bold text-gray-800">{{ product.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="categoryClass(product.category)">{{ product.category }}</span>
                </td>
                <td class="px-6 py-4 font-black text-gray-700">{{ product.price | currency }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span [class]="stockClass(product.stock, product.minStock)">{{ product.stock }}</span>
                    @if(product.stock <= product.minStock) {
                      <span class="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 border border-red-100 px-3 py-1 rounded-full shadow-sm">Reordenar</span>
                    }
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button (click)="adjustStock(product.id, product.stock + 1)" class="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></button>
                    <button (click)="adjustStock(product.id, product.stock - 1)" class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></button>
                    <button (click)="inventoryService.deleteProduct(product.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

       @if(showAddModal()) {
         <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div class="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-scale-in border border-slate-100">
             <h2 class="text-3xl font-black text-gray-900 mb-8 tracking-tight">Añadir Producto</h2>
             <div class="space-y-5">
               <div>
                 <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nombre</label>
                 <input #name type="text" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium">
               </div>
               <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Precio</label>
                  <input #price type="number" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium">
                </div>
                <div>
                  <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Stock Inicial</label>
                  <input #stock type="number" class="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium">
                </div>
               </div>
               <div class="flex gap-4 pt-6">
                 <button (click)="showAddModal.set(false)" class="flex-1 px-6 py-4 font-black text-[13px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">Cancelar</button>
                 <button (click)="saveNew(name.value, +price.value, +stock.value)" class="flex-1 px-6 py-4 bg-teal-600 text-white font-black text-[13px] uppercase tracking-widest rounded-xl shadow-xl shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all">Guardar</button>
               </div>
             </div>
           </div>
         </div>
       }
    </div>
  `
})
export class AdminInventoryComponent {
  public inventoryService = inject(InventoryService);
  showAddModal = signal(false);

  lowStockProducts = () => this.inventoryService.getProducts()().filter(p => p.stock <= p.minStock);

  adjustStock(id: string, amount: number) {
    if (amount < 0) return;
    this.inventoryService.updateStock(id, amount);
  }

  saveNew(name: string, price: number, stock: number) {
    if (!name || isNaN(price) || isNaN(stock)) return;
    this.inventoryService.addProduct({
      name,
      price,
      stock,
      category: 'medicine',
      minStock: 5
    });
    this.showAddModal.set(false);
  }

  categoryClass(cat: string) {
    const base = "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ";
    switch(cat) {
      case 'medicine': return base + "bg-purple-50 text-purple-700 border-purple-100/50";
      case 'food': return base + "bg-amber-50 text-amber-700 border-amber-100/50";
      default: return base + "bg-teal-50 text-teal-700 border-teal-100/50";
    }
  }

  stockClass(stock: number, min: number) {
    const base = "font-black ";
    return stock <= min ? base + "text-red-600" : base + "text-gray-800";
  }
}
