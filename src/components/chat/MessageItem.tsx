import React from 'react';
import { Message } from '../../types/chat';
import { ReasoningChain } from './ReasoningChain';
import { ToolExecutionCard } from './ToolExecutionCard';
import { useCopilot } from '../../context/CopilotContext';
import {
  Bot,
  User,
  Shield,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { setActiveCitation } = useCopilot();
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Lock className="h-3 w-3 text-emerald-400" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3.5 my-4 ${
        isAssistant ? 'items-start' : 'items-start flex-row-reverse'
      }`}
    >
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${
          isAssistant
            ? 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60'
            : 'bg-slate-800 text-slate-200 border-slate-700'
        }`}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${
          isAssistant ? 'items-start' : 'items-end'
        }`}
      >
        {/* Header Metadata */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono text-slate-400">
          <span className="font-semibold text-slate-300">
            {isAssistant ? 'KAVACHA Industrial Copilot' : 'Station Operator'}
          </span>
          <span>•</span>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {message.machineId && (
            <>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">{message.machineId}</span>
            </>
          )}
          {message.confidenceScore && (
            <Badge variant="success" size="xs">
              {message.confidenceScore.toFixed(1)}% Certainty
            </Badge>
          )}
        </div>

        {/* Content Box */}
        <div
          className={`rounded-xl px-4 py-3 border text-sm leading-relaxed ${
            isAssistant
              ? 'bg-slate-900/90 text-slate-100 border-slate-800 shadow-md backdrop-blur-sm'
              : 'bg-cyan-700/80 text-white border-cyan-600 shadow-md'
          }`}
        >
          {/* Markdown-style content parser */}
          <div className="space-y-2 prose-invert">
            {message.content.split('\n\n').map((block, idx) => {
              // Heading level 3 / 4
              if (block.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-sm font-bold text-cyan-300 tracking-wide mt-2 mb-1">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-xs font-semibold uppercase tracking-wider text-slate-300 mt-2 mb-1 font-mono">
                    {block.replace('#### ', '')}
                  </h4>
                );
              }
              if (block.startsWith('- ') || block.startsWith('1. ')) {
                const lines = block.split('\n');
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1 text-slate-200 text-xs">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx} className="leading-normal">
                        {line.replace(/^[-*]|\d+\.\s/, '').trim()}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-xs text-slate-200 leading-relaxed">
                  {block}
                </p>
              );
            })}
          </div>

          {/* Autonomous Reasoning Chain Accordion */}
          {message.reasoningSteps && message.reasoningSteps.length > 0 && (
            <ReasoningChain steps={message.reasoningSteps} />
          )}

          {/* Tool Calls */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <ToolExecutionCard toolCalls={message.toolCalls} />
          )}

          {/* SOP / Schematic Evidence Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileSearch className="h-3 w-3 text-cyan-400" />
                <span>Air-Gapped SOP Citations ({message.citations.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((citation) => (
                  <button
                    key={citation.id}
                    type="button"
                    onClick={() => setActiveCitation(citation)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-500/70 text-slate-300 hover:text-cyan-300 transition text-[11px] font-mono group"
                    title="Inspect retrieved chunk and SHA-256 integrity seal"
                  >
                    <span className="truncate max-w-[200px]">{citation.documentName}</span>
                    <span className="text-emerald-400 text-[10px]">
                      {citation.relevanceScore.toFixed(1)}%
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};