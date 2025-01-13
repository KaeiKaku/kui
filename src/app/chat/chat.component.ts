import { Component } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';

@Component({
  selector: 'app-chat',
  imports: [MenuComponent, ChatBoxComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {}
