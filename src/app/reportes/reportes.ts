import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Sale } from '../models/sales';

@Component({
  selector: 'app-reportes',
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
  standalone: true
})
export class Reportes {

  summary: any = {};
  sales: any[] = [];

  allSales: any[] = [];
  expandedSaleId: string | null = null;
  openMenuUserId: number | null = null;

  categories: string[] = [];
  brands: string[] = [];

  showFilters: boolean = false;
  searchTerm: string = '';
  isSearching: boolean = false;
  createdAt?: Date | null;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPage: number = 0;
  paginatedSales: any[] = [];
  Math = Math;

  ngOnInit() {
    this.getSummary();
    this.loadSales();
  }

  constructor(
    private readonly _cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  getSummary() {
    this._cartService.getSummary().subscribe(summary => {
      this.summary = summary;
      console.log('Resumen de ventas:', this.summary);
    });
  }

  parseDate(date: any): Date | null {
    if (!date) return null;

    if (typeof date.toDate === 'function') {
      return date.toDate();
    }

    if (typeof date === 'string' || typeof date === 'number') {
      return new Date(date);
    }

    if (date._seconds) {
      return new Date(date._seconds * 1000);
    }

    return null;
  }

  loadData() {
    this._cartService.getSummary().subscribe((res: any) => {
      this.summary = res;
    });

    this._cartService.getSales().subscribe((res: any[]) => {
      this.sales = res;
    });
  }


  loadSales() {
    this._cartService.getSales().subscribe({
      next: (data: Sale[]) => {

        const formattedSale = data.map((sale: any) => ({
          ...sale,
          createdAt: sale.createdAt?._seconds
            ? new Date(sale.createdAt._seconds * 1000)
            : null
        }));

        this.allSales = formattedSale;
        this.sales = [...formattedSale];

        this.currentPage = 1;
        this.calculateTotalPages();
      }
    })
  }

  toggleSale(id: string) {
    this.expandedSaleId = this.expandedSaleId === id ? null : id;
  }

  calculateTotalPages(): void {
    this.totalPage = Math.ceil(this.sales.length / this.itemsPerPage);
    this.updatePaginatedSales();
  }

  updatePaginatedSales(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSales = this.sales.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPage) {
      this.currentPage = page;
      this.updatePaginatedSales();
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedSales();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPage) {
      this.currentPage++;
      this.updatePaginatedSales();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPage, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleProfileMenu(userId: number) {
    this.openMenuUserId = this.openMenuUserId === userId ? null : userId;
    // this.showProfileMenu = !this.showProfileMenu;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadSales();
  }

  searchSales(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.clearFilters();
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();

    const filteredSales = this.allSales.filter(sale =>
      sale.userName?.toLowerCase().includes(term)
    );

    this.sales = filteredSales;

    this.currentPage = 1;
    this.calculateTotalPages();

    if (filteredSales.length === 0) {
      this.toastr.info('No se encontraron ventas', 'Búsqueda');
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sales = [...this.allSales];
    this.currentPage = 1;
    this.calculateTotalPages();
  }
}

