import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-consent-notice',
  imports: [],
  templateUrl: './consent-notice.component.html',
  styleUrl: './consent-notice.component.css',
})
export class ConsentNoticeComponent implements OnInit, OnDestroy {
  ngOnInit(): void {}
  ngOnDestroy(): void {
    sessionStorage.setItem('hasConsentNotice', 'true');
  }
  close!: () => void;
}
