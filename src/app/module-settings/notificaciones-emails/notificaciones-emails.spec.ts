import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionesEmails } from './notificaciones-emails';

describe('NotificacionesEmails', () => {
  let component: NotificacionesEmails;
  let fixture: ComponentFixture<NotificacionesEmails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionesEmails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificacionesEmails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
