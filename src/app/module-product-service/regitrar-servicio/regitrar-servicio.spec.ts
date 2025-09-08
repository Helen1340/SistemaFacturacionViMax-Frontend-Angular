import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegitrarServicio } from './regitrar-servicio';

describe('RegitrarServicio', () => {
  let component: RegitrarServicio;
  let fixture: ComponentFixture<RegitrarServicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegitrarServicio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegitrarServicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
