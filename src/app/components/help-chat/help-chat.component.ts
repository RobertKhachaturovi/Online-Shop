import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, Select } from '@ngxs/store';
import { LanguageState } from '../../state/language.state';
import { Observable, Subscription } from 'rxjs';

interface ChatMessage {
  text: string;
  from: 'user' | 'bot';
  time?: Date;
}

@Component({
  selector: 'app-help-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslateModule],
  templateUrl: './help-chat.component.html',
  styleUrl: './help-chat.component.scss',
})
export class HelpChatComponent implements OnInit, OnDestroy {
  readyQuestions: any[] = [];
  randomBotReplies: string[] = [];

  operatorNames = [
    'ნინო ბერიძე',
    'გიორგი ქავთარაძე',
    'თამარ ლომიძე',
    'ლევან მელიქიშვილი',
    'მარიამ აბაშიძე',
    'დავით კობახიძე',
    'სოფო კაპანაძე',
    'ნიკა ბერიშვილი',
    'ეკა ბერიძე',
    'გიგა კახიძე',
  ];

  chat: ChatMessage[] = [];

  userInput = '';
  loading = false;
  operatorName: string | null = null;
  operatorTimeout: any;
  headerOperatorName: string = '';
  feedbackModalOpen = false;
  feedbackRating: number | null = null;
  feedbackComment = '';
  feedbackSent = false;

  @Select(LanguageState.getCurrentLanguage)
  currentLanguage$!: Observable<string>;
  private languageSubscription?: Subscription;

  constructor(
    private translate: TranslateService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'ka';
    if (savedLang !== this.translate.currentLang) {
      this.translate.use(savedLang).subscribe(() => {
        this.loadTranslations();
        this.cdr.detectChanges();
      });
    } else {
      this.loadTranslations();
    }
    this.translate.onLangChange.subscribe((event) => {
      this.loadTranslations();
      this.cdr.detectChanges();
    });
    this.languageSubscription = this.currentLanguage$.subscribe(
      (lang: string) => {
        if (lang) {
          if (lang !== this.translate.currentLang) {
            this.translate.use(lang).subscribe(() => {
              this.loadTranslations();
              this.cdr.detectChanges();
            });
          } else {
            this.loadTranslations();
            this.cdr.detectChanges();
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadTranslations(): void {
    this.translate
      .get([
        'HELP_CHAT_QUESTION_1',
        'HELP_CHAT_ANSWER_1',
        'HELP_CHAT_QUESTION_2',
        'HELP_CHAT_ANSWER_2',
        'HELP_CHAT_QUESTION_3',
        'HELP_CHAT_ANSWER_3',
        'HELP_CHAT_QUESTION_4',
        'HELP_CHAT_ANSWER_4',
      ])
      .subscribe((translations: any) => {
        this.readyQuestions = [
          {
            q: translations['HELP_CHAT_QUESTION_1'],
            a: translations['HELP_CHAT_ANSWER_1'],
          },
          {
            q: translations['HELP_CHAT_QUESTION_2'],
            a: translations['HELP_CHAT_ANSWER_2'],
          },
          {
            q: translations['HELP_CHAT_QUESTION_3'],
            a: translations['HELP_CHAT_ANSWER_3'],
          },
          {
            q: translations['HELP_CHAT_QUESTION_4'],
            a: translations['HELP_CHAT_ANSWER_4'],
          },
        ];
      });
    this.translate
      .get([
        'HELP_CHAT_REPLY_1',
        'HELP_CHAT_REPLY_2',
        'HELP_CHAT_REPLY_3',
        'HELP_CHAT_REPLY_4',
      ])
      .subscribe((translations: any) => {
        this.randomBotReplies = [
          translations['HELP_CHAT_REPLY_1'],
          translations['HELP_CHAT_REPLY_2'],
          translations['HELP_CHAT_REPLY_3'],
          translations['HELP_CHAT_REPLY_4'],
        ];
      });
    this.translate
      .get('HELP_CHAT_INITIAL_MESSAGE')
      .subscribe((text: string) => {
        if (this.chat.length === 0) {
          this.chat = [
            {
              text: text,
              from: 'bot',
              time: new Date(),
            },
          ];
        } else if (this.chat.length > 0 && this.chat[0].from === 'bot') {
          this.chat[0].text = text;
        }
      });
  }

  sendUserMessage() {
    const text = this.userInput.trim();
    if (!text || this.loading) return;

    const now = new Date();
    this.chat.push({ text, from: 'user', time: now });
    this.userInput = '';
    this.loading = true;
    this.operatorName = null;
    clearTimeout(this.operatorTimeout);

    if (!this.headerOperatorName) {
      this.headerOperatorName = this.getRandomOperator();
    }

    const found = this.readyQuestions.find((q) => text === q.q);

    setTimeout(() => {
      const replyTime = new Date();
      if (found) {
        this.chat.push({ text: found.a, from: 'bot', time: replyTime });
      } else {
        const random =
          this.randomBotReplies[
            Math.floor(Math.random() * this.randomBotReplies.length)
          ];
        this.chat.push({ text: random, from: 'bot', time: replyTime });
      }

      this.loading = false;
      this.operatorName = this.headerOperatorName;
      this.operatorTimeout = setTimeout(() => {
        this.operatorName = null;
      }, 2000);
    }, 1200);
  }

  askReadyQuestion(q: string) {
    if (this.loading) return;
    this.userInput = q;
    this.sendUserMessage();
  }

  getRandomOperator(): string {
    const idx = Math.floor(Math.random() * this.operatorNames.length);
    return this.operatorNames[idx];
  }

  getTime(i: number): string {
    const msg = this.chat[i];
    if (!msg.time) return '';
    return msg.time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  openFeedbackModal() {
    this.feedbackModalOpen = true;
    this.feedbackRating = null;
    this.feedbackComment = '';
    this.feedbackSent = false;
  }

  closeFeedbackModal() {
    this.feedbackModalOpen = false;
    this.resetChat();
  }

  setFeedbackRating(rating: number) {
    this.feedbackRating = rating;
  }

  sendFeedback() {
    this.feedbackSent = true;

    setTimeout(() => {
      this.closeFeedbackModal();
    }, 1200);
  }

  resetChat() {
    this.translate
      .get('HELP_CHAT_INITIAL_MESSAGE')
      .subscribe((text: string) => {
        this.chat = [
          {
            text: text,
            from: 'bot',
            time: new Date(),
          },
        ];
      });
    this.userInput = '';
    this.headerOperatorName = '';
    this.operatorName = null;
    this.loading = false;
  }

  goToHome() {
    window.location.href = '/';
  }
}
