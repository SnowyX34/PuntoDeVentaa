import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {
  private cache = new Map<string, string>();

  // ✅ CORREGIDO: Aceptar string | undefined y validar
  getImage(key: string | undefined | null): string | null {
    // Validar que key existe y no es undefined/null
    if (!key || typeof key !== 'string' || key.trim() === '') {
      console.warn('ImageCache: key inválida', key);
      return null;
    }
    
    const cached = this.cache.get(key);
    return cached || null;
  }
  
  // ✅ CORREGIDO: Validar parámetros
  setImage(key: string | undefined | null, value: string | undefined | null): void {
    // Validar que key existe y es válida
    if (!key || typeof key !== 'string' || key.trim() === '') {
      console.warn('ImageCache: key inválida para setImage', key);
      return;
    }
    
    // Validar que value existe
    if (!value || typeof value !== 'string') {
      console.warn('ImageCache: value inválido para setImage', value);
      return;
    }
    
    this.cache.set(key, value);
    
    // Limitar caché a 50 imágenes (evitar memory leak)
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }
  
  // ✅ Método para verificar si existe una clave
  has(key: string | undefined | null): boolean {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      return false;
    }
    return this.cache.has(key);
  }
  
  // ✅ Método para eliminar una imagen específica del caché
  remove(key: string | undefined | null): void {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      return;
    }
    this.cache.delete(key);
  }
  
  // ✅ Método para limpiar todo el caché
  clearCache(): void {
    this.cache.clear();
    console.log('ImageCache: caché limpiado');
  }
  
  // ✅ Método para obtener el tamaño del caché
  getSize(): number {
    return this.cache.size;
  }
  
  // ✅ Método para obtener todas las claves (debug)
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}