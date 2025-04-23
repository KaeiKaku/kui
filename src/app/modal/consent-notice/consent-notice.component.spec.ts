import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentNoticeComponent } from './consent-notice.component';

describe('ConsentNoticeComponent', () => {
  let component: ConsentNoticeComponent;
  let fixture: ComponentFixture<ConsentNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentNoticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsentNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
