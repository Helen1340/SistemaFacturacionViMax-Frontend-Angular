import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialNotify } from './historial-notify';

describe('HistorialNotify', () => {
  let component: HistorialNotify;
  let fixture: ComponentFixture<HistorialNotify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialNotify]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialNotify);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
