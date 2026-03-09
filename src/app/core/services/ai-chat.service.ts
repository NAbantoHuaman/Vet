import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Message {
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private apiKey = environment.geminiApiKey;
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

  messages = signal<Message[]>([
    { text: '¡Hola! Soy VetAI, tu asistente inteligente de Veet App. ¿En qué puedo ayudar a tu mascota hoy?', sender: 'ai', timestamp: new Date() }
  ]);
  
  isTyping = signal(false);

  async sendMessage(text: string) {
    this.messages.update(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
    
    this.isTyping.set(true);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Actúa como un asistente veterinario profesional y amable de la clínica "Veet App". 
            Responde de forma concisa y útil a la siguiente consulta del cliente. 
            Si es algo grave, recomienda siempre agendar una cita o contactar a emergencias.
            Consulta: ${text}` }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error de Gemini API:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      this.messages.update(prev => [...prev, { 
        text: aiResponse, 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    } catch (error) {
      this.messages.update(prev => [...prev, { 
        text: 'Lo siento, he tenido un problema de conexión con mi cerebro artificial. Por favor, intenta de nuevo o contacta a la clínica directamente.', 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    } finally {
      this.isTyping.set(false);
    }
  }
}
