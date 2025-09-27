import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// SVG Icons
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const presetPrompts = [
  "List three reasons why the moon landing mattered.",
  "Who invented the World Wide Web and when?",
  "Explain how vaccines help our immune system.",
  "What caused the fall of the Roman Empire?"
];

const scoreBadge = (value, threshold) => {
  if (value >= threshold) return "bg-green-500/20 text-green-300";
  if (value >= threshold * 0.75) return "bg-yellow-500/20 text-yellow-300";
  return "bg-red-500/20 text-red-300";
};

function App() {
  const [view, setView] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);
  
  // Focus textarea when component mounts or after sending a message
  useEffect(() => {
    if (textareaRef.current && !loading) {
      textareaRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userQuestion = question.trim();
    if (!userQuestion || loading) return;

    setLoading(true);
    setQuestion("");

    // Add user message to conversations
    const newConversation = {
      id: Date.now().toString(),
      userQuestion,
      timestamp: new Date(),
      response: null,
      loading: true,
    };
    
    setConversations([...conversations, newConversation]);

    try {
      const { data } = await axios.post("/api/verify", { question: userQuestion });
      
      // Update conversation with response
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === newConversation.id 
            ? { ...conv, response: data, loading: false } 
            : conv
        )
      );
    } catch (error) {
      console.error("Error verifying:", error);
      
      // Update conversation with error
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === newConversation.id 
            ? { 
                ...conv, 
                loading: false, 
                error: "Sorry, I encountered an error processing your request."
              } 
            : conv
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setConversations([]);
    setQuestion("");
  };

  const setPrompt = (prompt) => {
    setQuestion(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (view === "docs") {
    return (
      <div className="flex h-screen flex-col bg-[#171923] text-gray-100">
        <header className="flex h-14 items-center justify-between border-b border-gray-700/50 px-4 py-3">
          <div className="flex items-center space-x-3">
            <span className="rounded bg-white/10 px-2.5 py-1 text-sm font-medium">Alethia</span>
            <span className="text-sm text-gray-400">Documentation</span>
          </div>
          <button 
            onClick={() => setView("chat")} 
            className="flex items-center rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
          >
            Return to Chat
          </button>
        </header>
        
        <div className="mx-auto flex-1 overflow-y-auto p-6 pt-10">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white">Alethia Documentation</h1>
            <p className="mt-4 text-lg text-gray-400">
              Fact-checking and hallucination detection for GPT-2 responses
            </p>
          </div>
          
          <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white">About Alethia</h2>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Alethia demonstrates how GPT-2 can generate hallucinations (false information) when answering 
                questions. It implements an automatic fact-checking system that verifies generated information 
                against Wikipedia sources.
              </p>
              <p className="mt-4 text-gray-300 leading-relaxed">
                The system generates responses using GPT-2, extracts claims from these responses,
                checks each claim against Wikipedia, and provides a verification score. If
                the average score falls below 0.8, the response is flagged as a potential hallucination.
              </p>
            </div>
          </div>
          
          <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white">How It Works</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-gray-300">
                <li>You ask a question through the chat interface</li>
                <li>GPT-2 generates a draft response</li>
                <li>The system extracts factual claims from the response</li>
                <li>Each claim is checked against Wikipedia sources</li>
                <li>Claims receive a similarity score (0 to 1)</li>
                <li>If the average score is below 0.8, the response is flagged as unreliable</li>
              </ol>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white">About GPT-2</h2>
              <p className="mt-4 text-gray-300 leading-relaxed">
                GPT-2 is a language model developed by OpenAI. While powerful, it can produce
                false information because it doesn't have a built-in fact-checking mechanism.
              </p>
              <p className="mt-4 text-gray-300 leading-relaxed">
                This tool demonstrates how such hallucinations can be detected through external
                verification using vector embeddings and semantic similarity.
              </p>
            </div>
          </div>
          
          <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white">Technical Stack</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-medium text-blue-300">Backend</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-300">
                  <li>Flask (Python web framework)</li>
                  <li>GPT-2 model via Transformers library</li>
                  <li>Sentence-Transformers for embeddings</li>
                  <li>NLTK for text processing</li>
                  <li>Wikipedia API for fact verification</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-blue-300">Frontend</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-300">
                  <li>React with Vite</li>
                  <li>TailwindCSS for styling</li>
                  <li>Axios for API communication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#171923] text-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'} flex h-[calc(100vh-130px)] flex-col border-r border-white/10 bg-[#0f1117] transition-all duration-300`}>
        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 p-3 text-sm transition hover:bg-white/10"
          >
            <PlusIcon /> New chat
          </button>
        </div>
        
        {/* History */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-1 px-2 py-3 text-xs uppercase text-gray-500">Chat History</div>
          {conversations.length === 0 ? (
            <div className="px-2 text-sm text-gray-500">No history yet</div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv, index) => (
                <div key={conv.id} className="rounded-lg p-3 text-sm hover:bg-white/10">
                  <div className="line-clamp-1 font-medium">
                    {conv.userQuestion}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {conv.timestamp?.toLocaleTimeString() || 'Just now'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Docs Link */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setView("docs")}
            className="w-full rounded-md bg-white/10 py-2 text-sm font-medium hover:bg-white/20"
          >
            Documentation
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-gray-700/50 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
            <div className="flex items-center">
              <span className="text-lg font-medium">Alethia</span>
              <span className="ml-2 text-sm text-gray-400">GPT-2 Fact Checker</span>
            </div>
          </div>
          <button 
            onClick={startNewChat} 
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-white/10"
          >
            <PlusIcon /> New Chat
          </button>
        </header>

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col overflow-scroll">
          {/* Messages */}
          <div className="flex-1 p-4 pb-32">
            {conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="max-w-2xl text-center">
                  <h2 className="mb-6 text-4xl font-bold">Alethia GPT-2 Fact Checker</h2>
                  <p className="mb-8 text-lg text-gray-400">
                    Ask a question and see how GPT-2 responds. Alethia will verify claims
                    against Wikipedia and highlight potential hallucinations.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {presetPrompts.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => setPrompt(prompt)}
                        className="rounded-xl bg-white/5 p-4 text-left text-sm transition hover:bg-white/10"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {conversations.map((conv) => (
                  <div key={conv.id} className="space-y-6">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="w-full max-w-2xl rounded-2xl rounded-tr-sm bg-blue-600/20 px-4 py-3 shadow-lg">
                        <p className="whitespace-pre-line text-sm text-gray-100">{conv.userQuestion}</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex">
                      <div className="w-full max-w-2xl rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 shadow-lg">
                        {conv.loading ? (
                          <div className="flex h-8 items-center space-x-2 px-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{ animationDuration: "1s", animationDelay: "0ms" }}></div>
                            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{ animationDuration: "1s", animationDelay: "200ms" }}></div>
                            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{ animationDuration: "1s", animationDelay: "400ms" }}></div>
                          </div>
                        ) : conv.error ? (
                          <div className="text-sm text-red-400">{conv.error}</div>
                        ) : conv.response ? (
                          <div className="space-y-6">
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                  GPT-2 Response 
                                  <span className="ml-2 font-normal">
                                    • Score {conv.response.average_score.toFixed(2)} / {conv.response.threshold}
                                  </span>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  conv.response.average_score >= conv.response.threshold 
                                    ? "bg-green-500/20 text-green-300" 
                                    : "bg-red-500/20 text-red-300"
                                }`}>
                                  {conv.response.is_verified ? "Verified" : "Unverified"}
                                </span>
                              </div>
                              
                              <p className="whitespace-pre-line text-sm text-gray-100">{conv.response.gpt2_response}</p>
                              
                              <div className={`mt-4 rounded-lg p-3 text-sm ${
                                conv.response.is_verified 
                                  ? "bg-green-900/20 text-green-200 border border-green-500/30" 
                                  : "bg-red-900/20 text-red-200 border border-red-500/30"
                              }`}>
                                <p>
                                  <span className="font-medium">
                                    {conv.response.is_verified 
                                      ? "✓ Response passed fact-checking" 
                                      : "✗ Potential hallucination detected"}
                                  </span>
                                  {' '}{conv.response.final_answer}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                  Claims Verified ({conv.response.claims.length})
                                </span>
                                <span className="text-xs text-gray-500">
                                  Threshold: {conv.response.threshold}
                                </span>
                              </div>
                              
                              <div className="grid gap-3 sm:grid-cols-2">
                                {conv.response.claims.map((claim, i) => (
                                  <div 
                                    key={`claim-${i}`} 
                                    className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
                                  >
                                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-3 py-2">
                                      <span className="text-xs font-medium">Claim {i + 1}</span>
                                      <span 
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                          scoreBadge(claim.similarity, conv.response.threshold)
                                        }`}
                                      >
                                        {claim.similarity.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="p-3">
                                      <p className="text-sm text-gray-200">{claim.claim}</p>
                                      
                                      <div className="mt-2 rounded-md bg-black/30 p-2 text-xs text-gray-400">
                                        {claim.snippet || "No supporting evidence found."}
                                      </div>
                                      
                                      {claim.source_url && (
                                        <a 
                                          href={claim.source_url} 
                                          target="_blank"
                                          rel="noreferrer"
                                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                          <span>Wikipedia: {claim.source_title || "Source"}</span>
                                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#171923] p-4 pb-6">
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
              <div className="relative rounded-xl border border-white/10 bg-[#0f1117] shadow-lg">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Send a message..."
                  rows={1}
                  className="max-h-48 min-h-[52px] w-full resize-none bg-transparent p-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="absolute bottom-1.5 right-2 rounded-lg bg-blue-600 p-1.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-500">
                Alethia checks GPT-2 responses against Wikipedia for accuracy
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;