import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface ChatMessage {
  text: string;
  from: 'user' | 'bot';
  time?: Date;
}

@Component({
  selector: 'app-help-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './help-chat.component.html',
  styleUrl: './help-chat.component.scss',
})
export class HelpChatComponent {
  readyQuestions = [
    {
      q: 'როგორ შევიძინო პროდუქტი?',
      a: 'პროდუქტის შესაძენად დაამატეთ კალათაში და დააჭირეთ "Check Out".',
    },
    {
      q: 'როგორ დავრეგისტრირდე?',
      a: 'რეგისტრაციისთვის გადადით "Registration" გვერდზე და შეავსეთ ფორმა.',
    },
    {
      q: 'როგორ დავუკავშირდე მხარდაჭერას?',
      a: 'მხარდაჭერასთან დასაკავშირებლად გამოიყენეთ კონტაქტის ფორმა ან მოგვწერეთ ელფოსტაზე.',
    },
    {
      q: 'შეკვეთის სტატუსის ნახვა',
      a: 'შეკვეთის სტატუსის სანახავად გადადით თქვენს პროფილში.',
    },
  ];

  randomBotReplies = [
    'ვწუხვართ, ამ კითხვაზე პასუხი ვერ მოიძებნა.',
    'ამ კითხვაზე პასუხი არ გვაქვს. სცადეთ სხვა კითხვა!',
    'ვერ გიპასუხებთ ამ კითხვაზე, სცადეთ მზა კითხვებიდან აირჩიოთ.',
    'სამწუხაროდ, ამ კითხვაზე პასუხი არ მოიძებნა.',
  ];

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

  chat: ChatMessage[] = [
    {
      text: 'გამარჯობა! რით შემიძლია დაგეხმარო?',
      from: 'bot',
      time: new Date(),
    },
  ];

  userInput = '';
  loading = false;
  operatorName: string | null = null;
  operatorTimeout: any;
  headerOperatorName: string = '';
  feedbackModalOpen = false;
  feedbackRating: number | null = null;
  feedbackComment = '';
  feedbackSent = false;

  constructor() {}

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
    this.chat = [
      {
        text: 'გამარჯობა! რით შემიძლია დაგეხმარო?',
        from: 'bot',
        time: new Date(),
      },
    ];
    this.userInput = '';
    this.headerOperatorName = '';
    this.operatorName = null;
    this.loading = false;
  }

  goToHome() {
    window.location.href = '/';
  }
}
