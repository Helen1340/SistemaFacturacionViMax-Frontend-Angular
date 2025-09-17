import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrosGenerales } from './parametros-generales';

describe('ParametrosGenerales', () => {
  let component: ParametrosGenerales;
  let fixture: ComponentFixture<ParametrosGenerales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametrosGenerales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametrosGenerales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
