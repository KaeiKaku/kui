import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatHeaderMsgComponent } from './chat-header-msg.component';

describe('ChatHeaderMsgComponent', () => {
  let component: ChatHeaderMsgComponent;
  let fixture: ComponentFixture<ChatHeaderMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHeaderMsgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatHeaderMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
