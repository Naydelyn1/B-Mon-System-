'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: '¿Qué servicios ofrecen?',
    answer:
      'Desarrollamos sistemas de ventas, sistemas clínicos, plataformas SaaS, aplicaciones web y software a medida. Cada solución es diseñada según las necesidades específicas de tu negocio.',
  },
  {
    question: '¿Cuánto cuesta un sistema?',
    answer:
      'El costo varía según la complejidad del proyecto. Tenemos desde soluciones base desde S/ 2,000 hasta proyectos a medida con presupuesto personalizado. ¡Contáctanos y te damos una cotización sin compromiso!',
  },
  {
    question: '¿Cuánto tiempo tarda el desarrollo?',
    answer:
      'Depende del alcance del proyecto. Un sistema estándar puede estar listo en 4 a 8 semanas. Para proyectos más grandes, coordinamos un cronograma contigo desde el inicio.',
  },
  {
    question: '¿Ofrecen soporte técnico?',
    answer:
      'Sí. Todos nuestros proyectos incluyen un período de soporte post-entrega. Además ofrecemos planes de mantenimiento continuo para que tu sistema siempre esté funcionando.',
  },
  {
    question: '¿Trabajan con empresas fuera de Perú?',
    answer:
      'Sí, trabajamos de forma remota con clientes en toda Latinoamérica. La comunicación y entrega de avances se hace de manera digital y fluida.',
  },
  {
    question: '¿Cómo puedo contactarlos?',
    answer:
      'Puedes escribirnos a través del formulario de contacto en esta página o directamente por WhatsApp. Respondemos en el menor tiempo posible.',
  },
];

const WELCOME: Message = {
  id: 0,
  from: 'bot',
  text: '¡Hola! 👋 Soy el asistente de B-MON System. ¿En qué puedo ayudarte hoy? Elige una pregunta o escríbeme directamente.',
};

let nextId = 1;

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [showFaqs, setShowFaqs] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (from: 'bot' | 'user', text: string) => {
    setMessages((prev) => [...prev, { id: nextId++, from, text }]);
  };

  const handleFaq = (faq: FAQ) => {
    setShowFaqs(false);
    addMessage('user', faq.question);
    setTimeout(() => {
      addMessage('bot', faq.answer);
      setTimeout(() => setShowFaqs(true), 400);
    }, 500);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setShowFaqs(false);
    addMessage('user', text);

    const match = FAQS.find((f) =>
      f.question.toLowerCase().includes(text.toLowerCase()) ||
      text.toLowerCase().includes(f.question.toLowerCase().split(' ').slice(1, 3).join(' '))
    );

    setTimeout(() => {
      addMessage(
        'bot',
        match
          ? match.answer
          : 'Gracias por tu mensaje. Para una respuesta más detallada, te recomendamos usar el formulario de contacto o escribirnos por WhatsApp. ¡Estaremos felices de ayudarte!',
      );
      setTimeout(() => setShowFaqs(true), 400);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-cream2 flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-navy px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">B-MON Asistente</p>
              <p className="text-white/50 text-xs">Respuesta inmediata</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.from === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-orange text-white rounded-br-sm'
                      : 'bg-white text-navy shadow-sm border border-cream2 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* FAQ chips */}
            {showFaqs && (
              <div className="flex flex-col gap-1.5 pt-1">
                {FAQS.map((faq) => (
                  <button
                    key={faq.question}
                    onClick={() => handleFaq(faq)}
                    className="text-left text-xs px-3 py-2 rounded-xl border border-orange/30 text-orange hover:bg-orange hover:text-white transition-colors bg-white shadow-sm"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-cream2 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange bg-white text-navy"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 flex items-center justify-center bg-orange hover:bg-orange/90 disabled:opacity-40 text-white rounded-xl transition-colors flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-orange hover:bg-orange/90 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Abrir chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
