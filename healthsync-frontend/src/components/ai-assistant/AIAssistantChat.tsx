import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  Sparkles, 
  Send, 
  X, 
  ArrowUpRight, 
  HelpCircle, 
  Activity,
  Mic,
  Copy,
  Download,
  Languages,
  MicOff
} from 'lucide-react';
import { cn } from '../../utils';
import { ChatMessage } from '../../types';

export const AIAssistantChat: React.FC = () => {
  const { chatMessages, sendChatMessage, isChatOpen, setChatOpen, addToast } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeLang, setActiveLang] = useState('English');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick command prompts
  const suggestions = [
    { label: 'Check oxygen cylinder surplus', text: 'Which facilities have excess oxygen cylinders?' },
    { label: 'Sunset PHC Paracetamol status', text: 'Predict paracetamol stockout timeline for Sunset PHC' },
    { label: 'ICU occupancy levels', text: 'Show ICU bed status in District Central' },
    { label: 'Epidemic risk predictions', text: 'Summarize infectious disease forecast' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === 'user') {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [chatMessages]);

  if (!isChatOpen) return null;

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendChatMessage(text);
    setInputText('');
  };

  const handleLangChange = (lang: string) => {
    setActiveLang(lang);
    addToast(`AI language switched to ${lang} (Simulation translation active)`, 'success');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Response copied to clipboard', 'success');
  };

  const handleDownloadTranscript = () => {
    const transcript = chatMessages.map(msg => 
      `[${msg.sender.toUpperCase()} - ${msg.timestamp}]\n${msg.text}\n`
    ).join('\n---\n\n');
    
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "healthsync_chat_transcript.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Chat report transcript downloaded successfully', 'success');
  };

  const handleVoiceInputToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    addToast('Listening to operational speech feed...', 'info');

    // Simulate transcribing after 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      setInputText('Predict paracetamol stockout timeline for Sunset PHC');
      addToast('Voice input transcribed successfully!', 'success');
    }, 2800);
  };

  const renderMessageContent = (msg: ChatMessage) => {
    const text = msg.text;
    const isAI = msg.sender === 'ai';

    // 1. Simple Markdown parsing
    const parseMarkdown = (rawText: string) => {
      let html = rawText;
      html = html.replace(/^### (.*$)/gim, '<h4 class="font-bold text-[11px] text-foreground mt-2 mb-0.5">$1</h4>');
      html = html.replace(/^## (.*$)/gim, '<h3 class="font-bold text-xs text-foreground mt-2 mb-0.5">$1</h3>');
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
      html = html.replace(/^\* (.*$)/gim, '<li class="ml-3.5 list-disc leading-tight mt-0.5">$1</li>');
      html = html.replaceAll('\n', '<br />');
      return <div dangerouslySetInnerHTML={{ __html: html }} className="leading-relaxed whitespace-pre-wrap text-[11px] text-foreground/90 font-medium" />;
    };

    // 2. Inline Chart Injection based on message keywords
    let chartNode = null;
    const lower = text.toLowerCase();
    
    if (isAI && (lower.includes('paracetamol') || lower.includes('stockout') || lower.includes('supply'))) {
      const drugData = [
        { name: 'Sunset PHC', Stock: 80, Safety: 120 },
        { name: 'Valley CHC', Stock: 4200, Safety: 500 }
      ];
      chartNode = (
        <div className="h-[120px] w-full mt-3 bg-muted/40 p-2 rounded border border-border/80">
          <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Comparative Stock vs Safety Limits</span>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={drugData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 7, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 7, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ fontSize: '8px' }} />
              <Bar name="Stock" dataKey="Stock" fill="#3b82f6" radius={[1, 1, 0, 0]} />
              <Bar name="Safety" dataKey="Safety" fill="#ef4444" radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (isAI && (lower.includes('bed') || lower.includes('icu') || lower.includes('occupancy'))) {
      const bedData = [
        { name: 'Metro Gen', Occupancy: 75 },
        { name: 'Sunset PHC', Occupancy: 60 },
        { name: 'Apex Cardiac', Occupancy: 90 }
      ];
      chartNode = (
        <div className="h-[120px] w-full mt-3 bg-muted/40 p-2 rounded border border-border/80">
          <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">ICU Occupancy %</span>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bedData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 7, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 7, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ fontSize: '8px' }} />
              <Bar name="Occupancy %" dataKey="Occupancy" fill="#a855f7" radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (isAI && (lower.includes('epidemic') || lower.includes('outbreak') || lower.includes('forecast'))) {
      const outbreakData = [
        { day: 'Mon', Inflow: 110 },
        { day: 'Tue', Inflow: 125 },
        { day: 'Wed', Inflow: 140 },
        { day: 'Thu', Inflow: 165 },
        { day: 'Fri', Inflow: 180 }
      ];
      chartNode = (
        <div className="h-[120px] w-full mt-3 bg-muted/40 p-2 rounded border border-border/80">
          <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Inflow Trend Projections</span>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={outbreakData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <XAxis dataKey="day" tick={{ fontSize: 7, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 7, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ fontSize: '8px' }} />
              <Area type="monotone" dataKey="Inflow" stroke="#ef4444" fill="rgba(239, 68, 68, 0.15)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {parseMarkdown(text)}
        {chartNode}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-border bg-card shadow-fluentXl sm:max-w-md animate-slide-in">
      {/* Drawer Header */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-muted/20 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              HealthSync AI Agent
            </h3>
            <span className="text-[10px] text-success font-semibold flex items-center gap-1 leading-none mt-0.5 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Google Health Model Live
            </span>
          </div>
        </div>
        
        {/* Languages and download options */}
        <div className="flex items-center gap-1.5">
          {/* Multilingual Selector */}
          <div className="relative">
            <select
              value={activeLang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="text-[10px] font-bold border border-border rounded bg-background px-1.5 py-1 focus:outline-none"
            >
              <option value="English">EN</option>
              <option value="Hindi">HI</option>
              <option value="Spanish">ES</option>
              <option value="French">FR</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownloadTranscript}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Download Chat Log"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChatOpen(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggested Prompts Grid */}
      {chatMessages.length === 1 && (
        <div className="border-b border-border/60 bg-muted/10 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            Quick Command Prompts
          </span>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug.text)}
                className="flex items-center justify-between rounded-md border border-border bg-card p-2 text-left text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground transition-all duration-150"
              >
                <span>{sug.label}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex flex-col gap-1.5 rounded-lg px-3 py-2.5 text-xs transition-all relative group',
              msg.sender === 'user'
                ? 'ml-auto bg-primary text-primary-foreground rounded-br-none shadow-sm w-max max-w-[85%]'
                : 'bg-muted border border-border/80 text-foreground rounded-bl-none w-full max-w-[95%]'
            )}
          >
            {renderMessageContent(msg)}

            {/* Copy Button (only for AI responses, visible on hover) */}
            {msg.sender === 'ai' && (
              <button
                onClick={() => handleCopyText(msg.text)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background border border-border/80 rounded hover:bg-muted text-muted-foreground"
                title="Copy response"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex w-max max-w-[85%] flex-col gap-1 rounded-lg bg-muted border border-border/80 px-3.5 py-2.5 rounded-bl-none">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/80 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/80 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/80" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="border-t border-border p-3 flex flex-col gap-2">
        {/* Flashing voice recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded p-2.5 text-[10px] font-bold tracking-wider uppercase animate-pulse select-none leading-none">
            <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
            Listening to operational speech... speaking Paracetamol stockout risk
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleVoiceInputToggle}
            className={cn(
              "h-9 w-9 shrink-0 shadow-sm transition-all",
              isRecording && "bg-destructive/20 border-destructive text-destructive hover:bg-destructive/35"
            )}
            title="Transcribe Voice Query"
          >
            {isRecording ? <MicOff className="h-4 w-4 text-destructive animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Query supply chains or bed allocations..."
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
            disabled={isRecording}
          />
          
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0 shadow-sm active:scale-95"
            disabled={!inputText.trim() || isTyping || isRecording}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
export default AIAssistantChat;
