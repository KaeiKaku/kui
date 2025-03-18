import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMessageComponent } from './home-message.component';

describe('HomeMessageComponent', () => {
  let component: HomeMessageComponent;
  let fixture: ComponentFixture<HomeMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
