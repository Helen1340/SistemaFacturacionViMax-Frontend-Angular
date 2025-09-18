import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiosNormativos } from './cambios-normativos';

describe('CambiosNormativos', () => {
  let component: CambiosNormativos;
  let fixture: ComponentFixture<CambiosNormativos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiosNormativos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiosNormativos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
