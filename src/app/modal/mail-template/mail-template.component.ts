import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MdToHtmlPipe } from '../../pipe/md-to-html.pipe';
import { CommonModule } from '@angular/common';
import { ChatgptService } from '../../service/chatgpt.service';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-mail-template',
  standalone: true,
  imports: [CommonModule, MdToHtmlPipe],
  templateUrl: './mail-template.component.html',
  styleUrl: './mail-template.component.css',
})
export class MailTemplateComponent {
  @ViewChild('preContent') preContent!: ElementRef;
  @ViewChild('container') _container!: ElementRef;

  selected_obj: any;
  mail_address: string = '';
  query: string = '';
  answer: string = '';

  is_loading: boolean = true;

  mail_template: string = '';

  constructor(
    private readonly chatgptService: ChatgptService,
    private readonly toastService: ToastService
  ) {}

  async generate_mail_template() {
    const query = `
あなたは、メール形式でテキストを整え、要約する日本語の専門家です。
以下の制約、ユーザーの質問、AIの回答、メールテンプレートに沿って、担当者への問い合わせメールの本文を作成してください。
 
#### 制約
- メールテンプレート内の[ユーザーの質問]は、AIの回答を全く参照せずに、ユーザーの質問を担当者への質問に整えるだけにすること。
- メールテンプレート内の[AIの回答の参考情報]は、担当者が、ユーザーはどのような情報を参照済みであるかをくみ取れるよう、AIの回答を簡潔にまとめること。
- メールテンプレート内の[担当者名],[所属と名前]はユーザーが入力するため置き換えないこと。
${
  this.mail_address
    ? ''
    : 'メールテンプレートの最初に「宛先が未登録のため、適切な宛先をユーザー側で設定してください。」という一行を太字で追加してください。'
}
 
#### ユーザーの質問
${this.query}
 
#### AIの回答
${this.answer}
 
#### メールテンプレート
${this.selected_obj['inquiry_contactor']}
 
お世話になっております。[所属と名前]です。
 
[ユーザーの質問]
 
なお、BrainHubの回答から以下の情報とSharepointサイトは既に参照しております。
[AIの回答の参考情報]
[AIの回答で提示されたリンク]
 
お忙しいところ恐れ入りますが、よろしくお願いいたします。
 
[名前と連絡先]`;

    const response = await this.chatgptService.steam(
      'qabotgeneral',
      this.resetHttpHeader(),
      {
        data: {
          query: query,
        },
      }
    );

    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const res = await reader?.read();
      if (res!.done) break;
      const content = res!.value as string;
      // response handling
      if (!content.startsWith('chatcmpl')) {
        this.mail_template += content;
      }
    }

    this.is_loading = false;
  }

  ngAfterViewInit(): void {
    this.generate_mail_template();
  }

  ngAfterViewChecked(): void {
    // this._container.nativeElement.scrollTop =
    //   this._container.nativeElement.scrollHeight -
    //   this._container.nativeElement.clientHeight;
  }

  resetHttpHeader(): any {
    // set session storage TOKEN
    if (sessionStorage.getItem('token') === null) {
      sessionStorage.setItem('token', String(Date.now()));
    }
    const token = sessionStorage.getItem('token');
    const username =
      sessionStorage.getItem('username') == null
        ? 'anonymous'
        : sessionStorage.getItem('username');
    return {
      'Content-Type': 'text/event-stream',
      Authorization: `${token}`,
      qabotusername: `${username}`,
    };
  }

  copy_template(): void {
    let element = this.preContent.nativeElement;
    let htmlContent = element.innerHTML;

    htmlContent = htmlContent.replace(
      /<p>/g,
      '<p style="margin:0; padding:0;">'
    );
    htmlContent = htmlContent.replace(/<\/p>\s*<p/g, '</p><br><p');

    htmlContent = `<div style="font-family: 'Yu Gothic', '游ゴシック', sans-serif; font-size: 11pt; line-height: 1;">
      ${htmlContent}
    </div>`;

    const textContent = element.innerText.replace(/\n{3,}/g, '\n');

    const blobHtml = new Blob([htmlContent], { type: 'text/html' });
    const blobText = new Blob([textContent], { type: 'text/plain' });

    const data = new ClipboardItem({
      'text/html': blobHtml,
      'text/plain': blobText,
    });

    navigator.clipboard
      .write([data])
      .then(() => {
        this.toastService.show('コピーが完了しました！ ✔️', 3000);
      })
      .catch((err) => {
        console.error('error:', err);
      });
  }

  close!: () => void;

  // showSnackBar(): void {
  //   this.snackBar.open('コピーが完了しました！', '', {
  //     horizontalPosition: this._horizontalPosition,
  //     verticalPosition: this._verticalPosition,
  //     duration: 3000,
  //   });
  // }
}
