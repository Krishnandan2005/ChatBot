
import React, { useEffect } from "react";
import { assets } from "../assets/assets";
import Markdown from "react-markdown";
import Prism from "prismjs";

import "prismjs/themes/prism-tomorrow.css";

function Message({ message }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  const isUser = message.role === "user";

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formattedTime = formatTimestamp(message.timestamp);

  return (
    <div className="w-full">
      {isUser ? (
        <div className="flex items-end justify-end gap-3 my-6">
          <div className="max-w-[85%] sm:max-w-2xl">
            <div className="px-4 py-3 rounded-3xl rounded-br-lg bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/20 border border-white/10">
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            </div>

            <span className="block mt-1 text-[11px] text-gray-400 text-right">
              {formattedTime}
            </span>
          </div>

          <img
            src={assets.user_icon}
            alt="User"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/20"
          />
        </div>
      ) : (
        <div className="flex items-start gap-3 my-6">
          <img
            src={assets.logo}
            alt="Assistant"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/20 mt-1"
          />

          <div className="max-w-[90%] sm:max-w-4xl">
            <div className="px-5 py-4 rounded-3xl rounded-tl-lg bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#211B2E] dark:via-[#1B1625] dark:to-[#14101C] border border-slate-200 dark:border-[#80609F]/20 shadow-xl backdrop-blur-md">
              {message.isImage ? (
                <img
                  src={message.content}
                  alt="Generated"
                  className="rounded-2xl max-w-full shadow-lg hover:scale-[1.01] transition-all duration-300"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-7 prose-headings:mb-3 prose-headings:mt-4 prose-li:my-1">
                  <Markdown
                    components={{
                      code({
                        inline,
                        className,
                        children,
                        ...props
                      }) {
                        if (inline) {
                          return (
                            <code
                              className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md text-[0.9em]"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        return (
                          <div className="relative my-4">
                            <pre className="rounded-2xl overflow-x-auto bg-[#0D1117] border border-[#30363D] p-4 text-sm">
                              <code
                                className={className}
                                {...props}
                              >
                                {children}
                              </code>
                            </pre>
                          </div>
                        );
                      },

                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-4">
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mb-3">
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mb-3">
                          {children}
                        </h3>
                      ),

                      p: ({ children }) => (
                        <p className="leading-7 mb-3">
                          {children}
                        </p>
                      ),

                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-2">
                          {children}
                        </ul>
                      ),

                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-2">
                          {children}
                        </ol>
                      ),

                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-purple-500 bg-purple-500/5 dark:bg-purple-500/10 pl-4 py-2 rounded-r-lg italic my-4">
                          {children}
                        </blockquote>
                      ),

                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                            {children}
                          </table>
                        </div>
                      ),

                      th: ({ children }) => (
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-left">
                          {children}
                        </th>
                      ),

                      td: ({ children }) => (
                        <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                          {children}
                        </td>
                      ),

                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </Markdown>
                </div>
              )}
            </div>

            <span className="block mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              {formattedTime}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Message;
