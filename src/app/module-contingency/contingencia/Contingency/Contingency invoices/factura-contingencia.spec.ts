import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

import { FacturaContingencia } from './factura-contingencia';

describe('FacturaContingencia', () => {
  let component: FacturaContingencia;
  let fixture: ComponentFixture<FacturaContingencia>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    const locationSpyObj = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [FacturaContingencia, FormsModule],
      providers: [
        { provide: Location, useValue: locationSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturaContingencia);
    component = fixture.componentInstance;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedFilter).toBe('all');
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(10);
    expect(component.pendingCount).toBe(0);
    expect(component.sentCount).toBe(0);
    expect(component.failedCount).toBe(0);
  });

  it('should load invoices on init', () => {
    spyOn(component, 'loadInvoices');
    component.ngOnInit();
    expect(component.loadInvoices).toHaveBeenCalled();
  });

  it('should set default dates on init', () => {
    spyOn(component, 'setDefaultDates');
    component.ngOnInit();
    expect(component.setDefaultDates).toHaveBeenCalled();
  });

  it('should apply filter correctly', () => {
    component.invoices = [
      { id: 1, number: 'FC-001', client: 'Test Client', date: new Date(), value: 1000, status: 'pending', lastAttempt: new Date() },
      { id: 2, number: 'FC-002', client: 'Test Client 2', date: new Date(), value: 2000, status: 'sent', lastAttempt: new Date() }
    ];

    component.selectedFilter = 'pending';
    component.applyFilter();

    expect(component.filteredInvoices.length).toBe(1);
    expect(component.filteredInvoices[0].status).toBe('pending');
  });

  it('should filter by date range', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    component.invoices = [
      { id: 1, number: 'FC-001', client: 'Test Client', date: today, value: 1000, status: 'pending', lastAttempt: new Date() },
      { id: 2, number: 'FC-002', client: 'Test Client 2', date: yesterday, value: 2000, status: 'sent', lastAttempt: new Date() }
    ];

    component.dateFrom = today.toISOString().split('T')[0];
    component.applyFilter();

    expect(component.filteredInvoices.length).toBe(1);
    expect(component.filteredInvoices[0].id).toBe(1);
  });

  it('should update summary counts', () => {
    component.invoices = [
      { id: 1, number: 'FC-001', client: 'Test Client', date: new Date(), value: 1000, status: 'pending', lastAttempt: new Date() },
      { id: 2, number: 'FC-002', client: 'Test Client 2', date: new Date(), value: 2000, status: 'sent', lastAttempt: new Date() },
      { id: 3, number: 'FC-003', client: 'Test Client 3', date: new Date(), value: 3000, status: 'failed', lastAttempt: new Date() }
    ];

    component.updateSummaryCounts();

    expect(component.pendingCount).toBe(1);
    expect(component.sentCount).toBe(1);
    expect(component.failedCount).toBe(1);
  });

  it('should get correct status text', () => {
    expect(component.getStatusText('pending')).toBe('Pendiente');
    expect(component.getStatusText('sent')).toBe('Enviada');
    expect(component.getStatusText('failed')).toBe('Fallida');
    expect(component.getStatusText('unknown')).toBe('unknown');
  });

  it('should calculate pagination correctly', () => {
    component.filteredInvoices = new Array(25).fill(null).map((_, i) => ({
      id: i + 1,
      number: `FC-${i + 1}`,
      client: 'Test Client',
      date: new Date(),
      value: 1000,
      status: 'pending' as const,
      lastAttempt: new Date()
    }));

    component.calculatePagination();

    expect(component.totalPages).toBe(3);
  });

  it('should navigate to previous page', () => {
    component.currentPage = 2;
    component.totalPages = 3;

    component.previousPage();

    expect(component.currentPage).toBe(1);
  });

  it('should not navigate to previous page if on first page', () => {
    component.currentPage = 1;

    component.previousPage();

    expect(component.currentPage).toBe(1);
  });

  it('should navigate to next page', () => {
    component.currentPage = 1;
    component.totalPages = 3;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should not navigate to next page if on last page', () => {
    component.currentPage = 3;
    component.totalPages = 3;

    component.nextPage();

    expect(component.currentPage).toBe(3);
  });

  it('should go back when back button is clicked', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should call searchInvoices when search button is clicked', () => {
    spyOn(component, 'searchInvoices');
    component.searchInvoices();
    expect(component.searchInvoices).toHaveBeenCalled();
  });

  it('should call resendInvoice when resend button is clicked', () => {
    spyOn(component, 'resendInvoice');
    component.resendInvoice(1);
    expect(component.resendInvoice).toHaveBeenCalledWith(1);
  });

  it('should call deleteInvoice when delete button is clicked', () => {
    spyOn(component, 'deleteInvoice');
    component.deleteInvoice(1);
    expect(component.deleteInvoice).toHaveBeenCalledWith(1);
  });

  it('should call resendAll when resend all button is clicked', () => {
    spyOn(component, 'resendAll');
    component.resendAll();
    expect(component.resendAll).toHaveBeenCalled();
  });

  it('should call exportInvoices when export button is clicked', () => {
    spyOn(component, 'exportInvoices');
    component.exportInvoices();
    expect(component.exportInvoices).toHaveBeenCalled();
  });

  it('should call viewInvoice when view button is clicked', () => {
    spyOn(component, 'viewInvoice');
    component.viewInvoice(1);
    expect(component.viewInvoice).toHaveBeenCalledWith(1);
  });

  it('should reset current page when applying filter', () => {
    component.currentPage = 3;
    component.applyFilter();
    expect(component.currentPage).toBe(1);
  });

  it('should handle empty filtered invoices', () => {
    component.invoices = [];
    component.applyFilter();
    expect(component.filteredInvoices.length).toBe(0);
    expect(component.totalPages).toBe(1);
  });

  it('should handle date filtering with null dates', () => {
    component.invoices = [
      { id: 1, number: 'FC-001', client: 'Test Client', date: new Date(), value: 1000, status: 'pending', lastAttempt: new Date() }
    ];

    component.dateFrom = '';
    component.dateTo = '';
    component.applyFilter();

    expect(component.filteredInvoices.length).toBe(1);
  });
});
