import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailTemplateComponent } from './mail-template.component';

describe('MailTemplateComponent', () => {
  let component: MailTemplateComponent;
  let fixture: ComponentFixture<MailTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
