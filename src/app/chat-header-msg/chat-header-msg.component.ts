import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-header-msg',
  imports: [],
  templateUrl: './chat-header-msg.component.html',
  styleUrl: './chat-header-msg.component.css',
})
export class ChatHeaderMsgComponent {
  @Input() linkTitle: string = '';
  @Input() link: string = '';
  @Input() similarityThreshold!: number;
  @Input() numberOfChunks!: number;
  @Input() activeCategoryKey!: string;
}
