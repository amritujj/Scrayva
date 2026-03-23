import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Play, Square, Mic, Volume2, Settings, PhoneCall, Loader2 } from 'lucide-react';

export default function AIReceptionist() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [agentVoice, setAgentVoice] = useState('aura-asteria-en');
  const [greeting, setGreeting] = useState('Hello! I am your AI receptionist. How can I help you today?');
  const [conversation, setConversation] = useState([]);

  // For visualizer
  const [audioLevel, setAudioLevel] = useState(0);

  // Mock function to simulate talking to Sarvam AI
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setStatus('Processing audio...');
      setIsProcessing(true);
      
      // Simulate Sarvam AI processing delay
      setTimeout(() => {
        setConversation(prev => [
          ...prev, 
          { role: 'user', text: 'I need help setting up a new web scraping workflow.' }
        ]);
        setStatus('Agent speaking...');
        
        // Simulate Agent response
        setTimeout(() => {
          setConversation(prev => [
            ...prev,
            { role: 'agent', text: 'Sure! I can help you with that. Are you looking to scrape a specific website like LinkedIn or something custom?' }
          ]);
          setStatus('Idle');
          setIsProcessing(false);
        }, 3000);
      }, 1500);

    } else {
      setIsRecording(true);
      setStatus('Listening...');
      setConversation([]);
    }
  };

  // Simulate audio visualizer
  useEffect(() => {
    let interval;
    if (isRecording || (isProcessing && status === 'Agent speaking...')) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording, isProcessing, status]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-purple-500/30">
      <Head>
        <title>AI Voice Receptionist | Scrayva</title>
      </Head>

      <Sidebar />
      <Navbar />

      <main className="pl-64 pt-16 transition-all duration-300">
        <div className="p-8 max-w-6xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                AI Voice Receptionist
              </h1>
              <p className="text-gray-400 mt-2">
                Powered by Sarvam AI. Configure your inbound voice agent to handle customer queries and qualify leads.
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 border ${
              isRecording ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              status === 'Agent speaking...' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              isProcessing ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
              'bg-white/5 border-white/10 text-gray-400'
            }`}>
              {isRecording ? (
                <><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span> {status}</>
              ) : status === 'Agent speaking...' ? (
                <><Volume2 size={16} className="animate-pulse" /> {status}</>
              ) : isProcessing ? (
                <><Loader2 size={16} className="animate-spin" /> {status}</>
              ) : (
                <><Mic size={16} /> Ready</>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Settings size={20} />
                  </div>
                  <h2 className="text-lg font-semibold">Agent Configuration</h2>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Greeting Message</label>
                    <textarea 
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-gray-200"
                      rows="3"
                      placeholder="e.g. Hello, how can I help you today?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Voice Model (Sarvam AI)</label>
                    <select 
                      value={agentVoice}
                      onChange={(e) => setAgentVoice(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-gray-200"
                    >
                      <option value="aura-asteria-en">Saaras - English Female</option>
                      <option value="aura-orion-en">Saaras - English Male</option>
                      <option value="bulbul-v3-hi">Bulbul - Hindi</option>
                      <option value="bulbul-v3-te">Bulbul - Telugu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Knowledge Base</label>
                    <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl bg-black/20 hover:bg-black/40 hover:border-purple-500/30 transition-all cursor-pointer">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Upload PDF or provide URL</p>
                        <p className="text-xs text-purple-400 mt-1">Browse files</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Panel */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                {/* Background visualizer waves */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute rounded-full border border-purple-500 transition-all duration-300 ease-out"
                      style={{
                        width: isRecording || status === 'Agent speaking...' ? `${100 + (audioLevel * (i + 1))}px` : '0px',
                        height: isRecording || status === 'Agent sequence...' ? `${100 + (audioLevel * (i + 1))}px` : '0px',
                        opacity: isRecording || status === 'Agent speaking...' ? 1 - (i * 0.2) : 0,
                      }}
                    />
                  ))}
                </div>

                <button 
                  onClick={toggleRecording}
                  disabled={isProcessing && !isRecording}
                  className={`relative z-10 flex items-center justify-center w-24 h-24 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-300 transform hover:scale-105 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_60px_rgba(239,68,68,0.5)]' 
                      : isProcessing
                      ? 'bg-gray-700 cursor-not-allowed hidden'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400'
                  }`}
                >
                  {isRecording ? <Square size={32} className="text-white fill-current" /> : <Mic size={36} className="text-white ml-1" />}
                </button>
                <div className="relative z-10 mt-6 text-center">
                  <h3 className="text-xl font-medium text-white">
                    {isRecording ? 'Tap to stop recording' : isProcessing ? 'Processing request...' : 'Tap to speak with AI Receptionist'}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                    {isRecording ? 'Speak clearly into your microphone.' : 'Test the selected Sarvam AI voice model and configuration.'}
                  </p>
                </div>
              </div>

              {/* Conversation Transcript */}
              {conversation.length > 0 && (
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 shadow-xl flex-1 max-h-[400px] flex flex-col">
                  <h3 className="text-sm font-medium text-gray-400 mb-4 px-2">Live Transcript</h3>
                  <div className="space-y-4 overflow-y-auto flex-1 px-2 pr-4 custom-scrollbar">
                    {conversation.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl p-4 text-sm ${
                          msg.role === 'user' 
                            ? 'bg-purple-600 text-white rounded-br-sm' 
                            : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
