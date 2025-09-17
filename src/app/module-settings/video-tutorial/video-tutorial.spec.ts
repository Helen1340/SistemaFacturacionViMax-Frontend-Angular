import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTutorial } from './video-tutorial';

describe('VideoTutorial', () => {
  let component: VideoTutorial;
  let fixture: ComponentFixture<VideoTutorial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoTutorial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoTutorial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
