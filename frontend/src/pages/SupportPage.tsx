import React, { useState, useRef, useEffect } from "react";
import { chatbotAPI } from "../services/api";
import { ChatMessage } from "../types";
import Spinner from "../components/ui/Spinner";
import AlertMessage from "../components/ui/AlertMessage";

const SupportPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "Hello! How can I help you with your banking needs today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Send message to API
      const response = await chatbotAPI.sendMessage(input.trim());

      // Check if we have a proper response
      if (!response || !response.data) {
        throw new Error("Empty response received from server");
      }

      // Try to get bot reply from response, or fallback to mock response
      const botReply =
        response?.data?.message || getBotResponse(userMessage.content);

      // Add bot message after a short delay to simulate typing
      setTimeout(() => {
        const botMessage: ChatMessage = {
          role: "bot",
          content:
            typeof botReply === "string"
              ? botReply
              : "I received your message.",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error: any) {
      console.error("Error sending message:", error);
      setLoading(false);
      setError("Failed to send message. Please try again later.");

      // Add error message
      const errorMessage: ChatMessage = {
        role: "bot",
        content:
          "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleKeyPressWithSafety(e);
    }
  };

  // Defensive wrapped function to prevent any keyboard event errors
  const handleKeyPressWithSafety = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    try {
      e.preventDefault();
      handleSendMessage();
    } catch (error) {
      console.error("Error handling keypress:", error);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  // Mock response generator for demo purposes
  const getBotResponse = (message: string): string => {
    if (!message) return "I'm here to help. What can I assist you with?";

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("loan") || lowerMessage.includes("borrow")) {
      return "We offer various loan products including personal loans, home loans, and auto loans. You can apply for a loan directly from the 'Loans' section of your dashboard. Would you like me to help you navigate there?";
    }

    if (lowerMessage.includes("account") || lowerMessage.includes("open")) {
      return "We offer checking and savings accounts with competitive rates. You can open a new account from the 'Accounts' section. Would you like to know more about our account types?";
    }

    if (
      lowerMessage.includes("transfer") ||
      lowerMessage.includes("send money")
    ) {
      return "You can make transfers between your accounts or to other banks from the 'Transfers' section. Would you like me to explain how to set up a new transfer?";
    }

    if (lowerMessage.includes("fraud") || lowerMessage.includes("suspicious")) {
      return "Your security is our top priority. If you notice any suspicious activity, please call our fraud department immediately at 1-800-555-0123. All your transactions are protected by our AI-powered fraud detection system that monitors for unusual patterns.";
    }

    if (lowerMessage.includes("invest") || lowerMessage.includes("stock")) {
      return "Our investment platform allows you to invest in stocks, bonds, mutual funds, ETFs, and more. You can view and manage your investments in the 'Investments' section. Would you like to know more about our investment options?";
    }

    if (lowerMessage.includes("fee") || lowerMessage.includes("charge")) {
      return "Our standard accounts have no monthly maintenance fees. For specific transaction fees, please refer to our fee schedule in the 'Settings' section under 'Account Information'. Is there a specific fee you're inquiring about?";
    }

    return "I'm here to help with any banking questions you might have. You can ask me about accounts, loans, transfers, investments, or anything else related to your banking experience. How else can I assist you today?";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Support</h1>

      {error && (
        <div className="mb-4">
          <AlertMessage
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      <div className="card">
        {/* Chat header */}
        <div className="bg-primary-600 text-white rounded-t-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-white rounded-full text-primary-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h2 className="font-bold">AI Banking Assistant</h2>
              <p className="text-sm text-primary-100">
                Online • Typically replies instantly
              </p>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50" id="chatMessages">
          {Array.isArray(messages) &&
            messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary-500 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-primary-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-4 max-w-xs md:max-w-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Reference for auto scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 input-field"
              placeholder="Type your message..."
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="ml-2 btn btn-primary"
              aria-label="Send message"
            >
              {loading ? (
                <Spinner size="sm" color="text-white" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {[
            {
              question: "How do I apply for a loan?",
              answer:
                'You can apply for a loan by navigating to the "Loans" section of your dashboard and clicking on "Apply for Loan". Follow the guided process to submit your application.',
            },
            {
              question: "Is my information secure?",
              answer:
                "Yes, we use state-of-the-art encryption and security measures to protect your personal and financial information. Our AI-powered fraud detection system also continuously monitors for suspicious activities.",
            },
            {
              question: "How do I report fraudulent activity?",
              answer:
                "If you notice any suspicious activity, please contact our fraud department immediately at 1-800-555-0123, which is available 24/7.",
            },
            {
              question: "What investment options do you offer?",
              answer:
                'We offer a wide range of investment options including stocks, bonds, mutual funds, ETFs, and cryptocurrency investments. Visit the "Investments" section to explore these options.',
            },
          ].map((faq, index) => (
            <div key={index} className="card p-4">
              <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
