import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../../core/services/ai-chat.service';

@Component({
  selector: 'app-floating-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[200]">
      <button 
        (click)="toggle()"
        class="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
      >
        @if(!isOpen()) {
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 rounded-full border-2 border-white animate-pulse"></span>
        } @else {
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        }
      </button>

      @if(isOpen()) {
        <div class="absolute bottom-20 right-0 w-[400px] h-[550px] max-w-[calc(100vw-3rem)] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-scale-in">
          
          <div class="p-6 bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg relative overflow-hidden">
            <div class="flex items-center gap-4 relative z-10">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-inner border border-white/20">
                <img 
                  src="https://static.vecteezy.com/system/resources/previews/005/893/586/non_2x/stethoscope-and-animal-footprint-veterinary-concept-silhouette-icon-veterinarian-medicine-equipment-glyph-pictogram-pet-dog-cat-health-care-service-icon-isolated-illustration-vector.jpg" 
                  alt="VetAI Icon"
                  class="w-full h-full object-cover"
                >
              </div>
              <div>
                <h3 class="font-black text-xl leading-tight tracking-tight">VetAI</h3>
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span class="text-[10px] font-bold uppercase tracking-widest opacity-80">En línea</span>
                </div>
              </div>
            </div>
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div #scrollContainer class="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 [scrollbar-width:none]">
            @for(msg of chatService.messages(); track msg.timestamp) {
              <div [class]="msg.sender === 'ai' ? 'flex justify-start' : 'flex justify-end'">
                <div [class]="msg.sender === 'ai' ? 'bg-white rounded-2xl rounded-bl-none shadow-sm text-gray-800 border border-gray-100' : 'bg-indigo-600 text-white rounded-2xl rounded-br-none shadow-lg'" 
                     class="max-w-[85%] p-4 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {{ msg.text }}
                </div>
              </div>
            }

            @if(chatService.isTyping()) {
              <div class="flex justify-start">
                <div class="bg-white rounded-2xl rounded-bl-none shadow-sm p-4 flex gap-1 items-center border border-gray-100">
                  <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div class="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div class="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            }
          </div>

          <div class="p-5 bg-white border-t border-gray-100">
            <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-[1.5rem] border border-gray-100 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
              <input 
                #msgInput
                type="text" 
                [disabled]="chatService.isTyping()"
                (keyup.enter)="send(msgInput.value); msgInput.value = ''"
                placeholder="Escribe tu consulta aquí..."
                class="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 text-sm font-semibold text-gray-700 placeholder:text-gray-400 disabled:opacity-50"
              >
              <button 
                (click)="send(msgInput.value); msgInput.value = ''"
                [disabled]="chatService.isTyping() || !msgInput.value.trim()"
                class="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-90 transition-all disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center group"
              >
                @if(chatService.isTyping()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                } @else {
                  <svg class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                }
              </button>
            </div>
            <p class="text-[9px] text-center text-gray-400 mt-3 font-bold uppercase tracking-tighter opacity-50">Consulta médica inteligente para tus peludos</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-scale-in {
      animation: scaleIn 0.3s ease-out;
    }
    @keyframes scaleIn {
      from { transform: scale(0.8) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
  `]
})
export class FloatingChatComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('msgInput') private msgInput!: ElementRef;

  public chatService = inject(AiChatService);
  isOpen = signal(false);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      setTimeout(() => this.msgInput?.nativeElement.focus(), 100);
    }
  }

  send(text: string) {
    if (!text.trim() || this.chatService.isTyping()) return;
    this.chatService.sendMessage(text);
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
