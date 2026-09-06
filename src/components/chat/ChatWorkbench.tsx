import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../../api/chatApi';
import { Message, PromptPreset } from '../../types/chat';
import { useCopilot } from '../../context/CopilotContext';
import { MessageItem } from './MessageItem';
import { PromptPresets } from './PromptPresets';
import {
  Send,
  Trash2,
  StopCircle,
  Cpu,
  ShieldCheck,
  Paperclip,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ChatWorkbench: React.FC = () => {
  const { activeMachine } = useCopilot();
  const [messages, setMessages] = useState<Message[]>([]);
  const [presets, setPresets] = useState<PromptPreset[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadChat();
  }, []);

  const loadChat = async () => {
    try {
      const [history, promptPresets] = await Promise.all([
        chatApi.getHistory(),
        chatApi.getPresets(),
      ]);
      setMessages(history);
      setPresets(promptPresets);
    } catch (err) {
      console.error('Failed to load chat workbench', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    setInputPrompt('');
    setIsLoading(true);
    setStreamingText('');

    try {
      await chatApi.sendMessage(
        promptToSend,
        activeMachine.id,
        (partial) => {
          setStreamingText(partial);
        }
      );
      const updatedHistory = await chatApi.getHistory();
      setMessages(updatedHistory);
    } catch (err) {
      console.error('Inference error', err);
    } finally {
      setIsLoading(false);
      setStreamingText(null);
    }
  };

  const handleClear = async () => {
    await chatApi.clearHistory();
    const updated = await chatApi.getHistory();
    setMessages(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
      {/* Workbench Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/90 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
            Industrial Copilot Workbench
          </span>
          <Badge variant="cyan" size="xs">
            vLLM 7B On-Prem
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition font-mono"
            title="Reset Context History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Session</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {/* Live Streaming Placeholder */}
        {streamingText && (
          <div className="flex gap-3.5 my-4 items-start">
            <div className="h-8 w-8 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-700/60 flex items-center justify-center shrink-0 animate-pulse">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex flex-col max-w-[85%]">
              <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-cyan-400">
                <span className="font-semibold">Inferencing locally (Mistral-7B-Industrial)...</span>
                <span className="animate-spin text-xs">⠋</span>
              </div>
              <div className="rounded-xl px-4 py-3 border border-slate-800 bg-slate-900 text-slate-100 text-xs leading-relaxed whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Presets if history is minimal */}
        {messages.length <= 2 && !isLoading && (
          <div className="my-6 max-w-2xl mx-auto">
            <PromptPresets presets={presets} onSelect={(p) => handleSend(p.prompt)} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Composer */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-900/90 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative rounded-lg border border-slate-700/80 bg-slate-950 shadow-inner focus-within:border-cyan-500 transition-colors"
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask KAVACHA about ${activeMachine.name} (e.g. vibration limits, SOP steps, LOTO isolation)...`}
            className="w-full resize-none bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/60 bg-slate-950/60 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Air-Gapped: Zero Exfiltration
              </span>
              <span className="hidden sm:inline-block text-slate-600">|</span>
              <span className="hidden sm:inline-block text-slate-500">
                Target: {activeMachine.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isLoading}
                disabled={!inputPrompt.trim() || isLoading}
                icon={<Send className="h-3.5 w-3.5" />}
              >
                Send Query
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};