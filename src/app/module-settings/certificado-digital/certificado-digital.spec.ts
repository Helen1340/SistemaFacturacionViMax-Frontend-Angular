import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificadoDigital } from './certificado-digital';

describe('CertificadoDigital', () => {
  let component: CertificadoDigital;
  let fixture: ComponentFixture<CertificadoDigital>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificadoDigital]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificadoDigital);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
