import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchSubject = new BehaviorSubject<string>('');
  search$ = this.searchSubject.asObservable();

  // Actualizar término de búsqueda
  setSearch(term: string) {
    this.searchSubject.next(term);
  }

  // Limpiar búsqueda
  clear() {
    this.searchSubject.next('');
  }
}