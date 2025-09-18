import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpuestosRetenciones } from './impuestos-retenciones';

describe('ImpuestosRetenciones', () => {
  let component: ImpuestosRetenciones;
  let fixture: ComponentFixture<ImpuestosRetenciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpuestosRetenciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpuestosRetenciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
