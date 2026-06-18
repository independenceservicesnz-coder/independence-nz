'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_REPLIES = [
  { label: '🧹 Book a service', action: 'I want to book a home service. What do I do first?' },
  { label: '🔍 Browse providers', action: 'How do I find a provider near me?' },
  { label: '💳 How does payment work?', action: 'How does payment work? Is my money safe?' },
  { label: '✅ Are providers safe?', action: 'How do I know the providers are trustworthy and safe?' },
  { label: '💰 How much does it cost?', action: 'How much does it cost to use Independence NZ?' },
  { label: '📞 Talk to someone', action: 'I would like to speak to a real person.' },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Kia ora! 👋 I'm here to help you find trusted home services. What can I help you with today?",
      }])
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setShowQuickReplies(false)

    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    // Check if user wants to browse or book — offer navigation
    const lower = text.toLowerCase()
    const wantsToBrowse = lower.includes('browse') || lower.includes('find a provider') || lower.includes('find provider')
    const wantsToBook = lower.includes('book') && (lower.includes('now') || lower.includes('go') || lower.includes('ready'))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data.message ?? "Sorry, something went wrong. Please call us on 027 325 9707."

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

      // Auto-navigate if appropriate
      if (wantsToBrowse) {
        setTimeout(() => router.push('/browse'), 1500)
      } else if (wantsToBook) {
        setTimeout(() => router.push('/book'), 1500)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please call us on 027 325 9707 and we'll be happy to help.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReply = (action: string) => {
    sendMessage(action)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open help chat'}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-green-700 text-white shadow-xl flex items-center justify-center hover:bg-green-800 transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ boxShadow: '0 4px 24px rgba(21,128,61,0.45)' }}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {/* Pulse indicator when closed */}
        {!open && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '520px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
        >
          {/* Header */}
          <div className="bg-green-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              IN
            </div>
            <div>
              <p className="text-white font-semibold text-base leading-tight">Independence NZ</p>
              <p className="text-green-200 text-xs">Here to help — ask me anything</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-green-200 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-base leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-700 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Quick replies */}
            {showQuickReplies && messages.length === 1 && !loading && (
              <div className="pt-1 space-y-2">
                {QUICK_REPLIES.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(qr.action)}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-white border border-green-200 text-green-800 text-base font-medium hover:bg-green-50 hover:border-green-400 transition-colors shadow-sm"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:opacity-50 bg-gray-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-white border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400">
              Need more help?{' '}
              <a href="tel:02732597070" className="text-green-700 font-medium hover:underline">
                Call 027 325 9707
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
