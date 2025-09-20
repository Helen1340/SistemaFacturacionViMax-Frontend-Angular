import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoImpuesto } from './nuevo-impuesto';

describe('NuevoImpuesto', () => {
  let component: NuevoImpuesto;
  let fixture: ComponentFixture<NuevoImpuesto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoImpuesto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoImpuesto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
