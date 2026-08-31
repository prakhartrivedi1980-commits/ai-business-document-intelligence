import {
  ArrowUp,
  Bot,
  FileSearch,
  MessageSquareText,
  Sparkles,
  User,
} from "lucide-react";

import { motion } from "motion/react";

import "./Chat.css";


function Chat({
  question,
  setQuestion,
  messages,
  chatLoading,
  chatError,
  handleAskQuestion,
  handleQuestionKeyDown,
}) {
  const suggestions = [
    "Summarize the main findings",
    "What are the most important details?",
    "Explain this document simply",
  ];


  const handleSuggestion = (suggestion) => {
    if (chatLoading) {
      return;
    }

    setQuestion(suggestion);
  };


  return (
    <motion.section
      className="premium-chat"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      {/* HEADER */}

      <div className="premium-chat__header">

        <div className="premium-chat__heading">

          <div className="premium-chat__heading-icon">
            <MessageSquareText size={19} />
          </div>

          <div>
            <span>DOCUMENT AI</span>

            <h3>
              Chat with your document
            </h3>

            <p>
              Ask questions grounded in the
              uploaded content.
            </p>
          </div>

        </div>


        <div className="premium-chat__online">
          <span />
          AI ready
        </div>

      </div>


      {/* MESSAGES */}

      <div className="premium-chat__messages">

        {messages.length === 0 && (
          <motion.div
            className="premium-chat__empty"
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
          >
            <div className="premium-chat__empty-icon">
              <Sparkles size={22} />
            </div>

            <h4>
              Start a conversation
            </h4>

            <p>
              Ask about facts, sections, people,
              dates, numbers or anything contained
              in your document.
            </p>


            <div className="premium-chat__suggestions">

              {suggestions.map(
                (suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() =>
                      handleSuggestion(
                        suggestion
                      )
                    }
                  >
                    <FileSearch size={13} />

                    {suggestion}
                  </button>
                )
              )}

            </div>

          </motion.div>
        )}


        {messages.map(
          (message, index) => (
            <motion.div
              key={`${index}-${message.role}`}
              className={`premium-message ${
                message.role === "user"
                  ? "premium-message--user"
                  : "premium-message--assistant"
              }`}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <div className="premium-message__avatar">

                {message.role === "user" ? (
                  <User size={15} />
                ) : (
                  <Bot size={16} />
                )}

              </div>


              <div className="premium-message__body">

                <span className="premium-message__role">
                  {message.role === "user"
                    ? "You"
                    : "Document AI"}
                </span>


                <p>
                  {message.content}
                </p>


                {message.role === "assistant" &&
                  message.sources?.length > 0 && (
                    <details className="premium-message__sources">

                      <summary>
                        <FileSearch size={13} />

                        View retrieved sources
                      </summary>


                      <div className="premium-message__source-list">

                        {message.sources.map(
                          (
                            source,
                            sourceIndex
                          ) => (
                            <div
                              className="premium-message__source"
                              key={sourceIndex}
                            >
                              <span>
                                Source{" "}
                                {sourceIndex + 1}
                              </span>

                              <p>
                                {source}
                              </p>
                            </div>
                          )
                        )}

                      </div>

                    </details>
                  )}

              </div>

            </motion.div>
          )
        )}


        {/* AI THINKING */}

        {chatLoading && (
          <motion.div
            className="premium-message premium-message--assistant"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div className="premium-message__avatar">
              <Bot size={16} />
            </div>


            <div className="premium-message__body">

              <span className="premium-message__role">
                Document AI
              </span>

              <div className="premium-chat__typing">
                <span />
                <span />
                <span />
              </div>

            </div>

          </motion.div>
        )}

      </div>


      {/* ERROR */}

      {chatError && (
        <div className="premium-chat__error">
          {chatError}
        </div>
      )}


      {/* INPUT */}

      <div className="premium-chat__composer">

        <div className="premium-chat__input">

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={
              handleQuestionKeyDown
            }
            placeholder="Ask anything about this document..."
            rows="1"
            disabled={chatLoading}
          />


          <button
            type="button"
            className="premium-chat__send"
            onClick={handleAskQuestion}
            disabled={
              !question.trim() ||
              chatLoading
            }
            aria-label="Send question"
          >
            <ArrowUp size={18} />
          </button>

        </div>


        <div className="premium-chat__hint">
          <span>
            Answers are grounded in your document
          </span>

          <span>
            Enter to send · Shift + Enter for new line
          </span>
        </div>

      </div>

    </motion.section>
  );
}


export default Chat;