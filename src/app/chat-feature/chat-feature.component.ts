import { Component } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-chat-feature',
  standalone: true,
  imports: [],
  templateUrl: './chat-feature.component.html',
  styleUrl: './chat-feature.component.css'
})
export class ChatComponent {
  private socket$: WebSocketSubject<any>;
  public messages: any[] = [];
  public messageContent: string = '';
  public username: string = '';
  public store: string = '';
  public department: string = '';
  public showNewUserModal: boolean = false;
  public isAdmin: boolean = false;
  public pendingUsers: any[] = [];

  constructor() {
    this.socket$ = new WebSocketSubject('ws://localhost:8080/chat');

    this.socket$.subscribe(
      message => {
        console.log('Message received: ', message);
        this.handleMessage(message);
      },
      err => console.error(err),
      () => console.warn('Completed!')
    );
  }

  handleMessage(message: any) {
    if (message.type === 'new-user') {
      this.showNewUserModal = true;
    } else if (message.type === 'admin') {
      this.isAdmin = true;
      this.pendingUsers = message.pendingUsers;
    } else {
      this.messages.push(message);
    }
  }

  sendMessage() {
    if (this.messageContent.trim()) {
      this.socket$.next({ type: 'message', content: this.messageContent });
      this.messageContent = '';
    }
  }

  register() {
    this.socket$.next({ type: 'register', username: this.username, store: this.store, department: this.department });
    this.showNewUserModal = false;
  }

  approveUser(ip: string) {
    this.socket$.next({ type: 'approve', ip });
  }

  declineUser(ip: string) {
    this.socket$.next({ type: 'decline', ip });
  }

  logout() {
    this.isAdmin = false;
    this.socket$.next({ type: 'logout' });
  }
}