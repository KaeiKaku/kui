import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChatHeaderMsgComponent } from '../chat-header-msg/chat-header-msg.component';
import { ModalService } from '../service/modal.service';
import { ConsentNoticeComponent } from '../modal/consent-notice/consent-notice.component';
import { StatusService } from '../service/status.service';
import { ChatgptService } from '../service/chatgpt.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParseObjPipe } from '../pipe/parse-obj.pipe';
import { MdToHtmlPipe } from '../pipe/md-to-html.pipe';
import { MailTemplateComponent } from '../modal/mail-template/mail-template.component';
import { ToastService } from '../service/toast.service';

interface ChatContent {
  query: string;
  answer: string;
  is_loading: boolean;
  mailto?: boolean;
  has_inquiry_page?: boolean;
  responseId?: string;
  goodOrBad?: string;
  comment?: string;
  referenceLink?: any[];
}

@Component({
  selector: 'app-chat-box',
  imports: [CommonModule, ChatHeaderMsgComponent, MdToHtmlPipe, FormsModule],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css',
  providers: [ParseObjPipe],
  standalone: true,
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  @ViewChild('chat_box_container') chat_box_container!: ElementRef;
  @ViewChild('textarea_container') textarea_container!: ElementRef;
  @ViewChild('textarea') textarea!: ElementRef;
  @ViewChild('commentTextarea') textarea_comment!: ElementRef;
  @ViewChild('attachments_container') attachments_container!: ElementRef;

  @HostListener('document:keydown.enter', ['$event'])
  is_sendReady: boolean = false;

  options_model: string = 'GPT-4.1';
  options_reference: boolean = false;
  options_quiz: boolean = false;

  selected_obj: any;
  selected_subfolders!: string[];
  selected_category!: string;
  selected_page!: string;
  chat_contents: ChatContent[] = [];
  uploaded_images: string[] = [];

  readonly selected$!: Observable<Record<string, any>>;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly modalService: ModalService,
    private readonly statusService: StatusService,
    private readonly chatgptService: ChatgptService,
    private readonly parseObjPipe: ParseObjPipe,
    private readonly toastService: ToastService
  ) {
    this.selected$ = this.statusService.get_status$('kui.selected');
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    if (
      (e.target as HTMLElement).tagName == 'TEXTAREA' &&
      (e.target as HTMLElement).id === 'chat-box-textarea' &&
      this.is_sendReady
    ) {
      this.submit();
    }
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.selected$.subscribe((selected) => {
        if (selected && selected['category']) {
          // ConsentNotice
          if (!window.sessionStorage.getItem('hasConsentNotice')) {
            this.modalService.open(ConsentNoticeComponent, {
              width: '60%',
              maxHeight: '80%',
              closeOnBackdropClick: false,
            });
          }

          this.is_sendReady = true;
          this.selected_obj = this.parseObjPipe.transform(
            selected['category']
          ).value;
          this.selected_category = this.parseObjPipe.transform(
            selected['category']
          ).key;
          this.selected_page = selected['page'];
          this.selected_subfolders = selected['selected_subfolders'];
        }
      })
    );
  }

  resetTextarea(): void {
    // reset the text area height and value after submit a request
    this.textarea.nativeElement.value = '';
    this.uploaded_images = [];
    document.querySelectorAll('.upload_container').forEach((el) => el.remove());
  }

  handleImages(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const img_data = event.target.result as string;
            this.uploaded_images.push(img_data);
            const section = document.createElement('section');
            section.classList.add('upload_container');
            this.attachments_container.nativeElement.appendChild(section);
            const img = document.createElement('img');
            img.src = img_data;
            img.classList.add('upload');
            section.appendChild(img);
            const deleteIcon = document.createElement('button');
            deleteIcon.innerHTML = '✖';
            deleteIcon.classList.add('delete_uploaded');
            deleteIcon.onclick = () => {
              section.remove();
              const index = this.uploaded_images.indexOf(img_data);
              if (index !== -1) {
                this.uploaded_images.splice(index, 1);
              }
            };
            section.appendChild(deleteIcon);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // clear input value to trigger change $e
    input.value = '';
  }

  async submit(): Promise<void> {
    // check if textarea is empty
    if (this.textarea.nativeElement.value == '') {
      return;
    }

    this.is_sendReady = false;

    const render_category_dict = this.statusService.get_status_snapshot(
      'kui.render.category_dict'
    );
    const query = this.textarea.nativeElement.value;
    const el = this.chat_box_container.nativeElement;
    el.scrollTop = el.scrollHeight;
    const img_urls = this.uploaded_images;

    this.resetTextarea();

    this.chat_contents.unshift({
      query: query,
      answer: '',
      is_loading: true,
      mailto: false,
      has_inquiry_page: false,
      responseId: '',
      goodOrBad: '',
      comment: '',
      referenceLink: [],
    });

    let requestData: any = { query };
    if (this.selected_page === 'general') {
      requestData.imgUrls = img_urls;
      requestData.model = this.options_model;
    } else {
      requestData.folderSearch = false;
      requestData.subFolders = this.filderSubfolders(
        this.selected_subfolders,
        render_category_dict[this.selected_category]['_sub_folders']
      );
      requestData.reference_each_folder = this.options_reference;
    }

    const api_suffix = this.options_quiz
      ? this.selected_obj['api_suffix_quiz']
      : this.selected_obj['api_suffix'];

    const response = await this.chatgptService.steam(
      api_suffix,
      this.resetHttpHeader(),
      { data: requestData }
    );

    const current_chat_content = this.chat_contents.at(0)!;
    current_chat_content.is_loading = false;

    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const res = await reader?.read();
      if (res!.done) break;
      const content = res!.value as string;
      // response handling
      if (content.startsWith('chatcmpl')) {
        current_chat_content.responseId = content;
      } else {
        current_chat_content.answer += content;
      }
    }

    // brainhub setting
    current_chat_content.mailto = this.selected_obj.inquiry_email
      ? true
      : false;
    current_chat_content.has_inquiry_page = this.selected_obj.inquiry_page
      ? true
      : false;

    // clean
    this.is_sendReady = true;
  }

  filderSubfolders(
    selected_subfolders: string[],
    _sub_folders: string[]
  ): string[] {
    return selected_subfolders.filter((item) => _sub_folders.includes(item));
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

  feedback(
    chatContent: ChatContent,
    goodOrBad: string | null = null,
    textarea: HTMLTextAreaElement | null = null
  ): void {
    const commentCategory =
      this.selected_category === 'general' ? 'general' : 'info';

    const payload: any = {
      Id: chatContent.responseId,
      CommentCategory: commentCategory,
      Page: this.selected_page,
      Category: this.selected_category,
    };

    if (goodOrBad !== null) {
      chatContent.goodOrBad = goodOrBad;
      payload.GoodOrBad = goodOrBad;
    } else if (chatContent.comment && !goodOrBad && textarea) {
      payload.Comment = chatContent.comment;
    }

    this.chatgptService
      .post('responsecomment', payload, true)
      .subscribe((_) => {
        if (chatContent.comment && (textarea as HTMLTextAreaElement)) {
          (textarea as HTMLTextAreaElement).disabled = true;
        }
      });
  }

  resetSessionToken(): void {
    if (sessionStorage.getItem('token')) {
      this.chatgptService
        .post('removesessiontoken', {
          token: sessionStorage.getItem('token'),
        })
        .subscribe((res) => {
          if (res == 'finish') {
            this.chat_contents = [];
            this.resetTextarea();
            this.toastService.show('履歴クリアしました！ ✔️', 3000);
          }
        });
      sessionStorage.setItem('token', String(Date.now()));
    }
  }

  popupMailtemplate(query: string, answer: string) {
    this.modalService.open(MailTemplateComponent, {
      width: '50%',
      maxHeight: '80%',
      closeOnBackdropClick: false,
      data: {
        selected_obj: this.selected_obj,
        mail_address: this.selected_obj['inquiry_email'],
        query: query,
        answer: answer,
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }
}
