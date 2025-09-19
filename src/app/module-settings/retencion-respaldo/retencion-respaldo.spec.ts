import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetencionRespaldo } from './retencion-respaldo';

describe('RetencionRespaldo', () => {
  let component: RetencionRespaldo;
  let fixture: ComponentFixture<RetencionRespaldo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetencionRespaldo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetencionRespaldo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
