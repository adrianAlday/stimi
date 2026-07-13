"use client";

import { useRef, useState, useEffect } from "react";
import { redirect } from "next/navigation";

type MessageFormProps = {
  cookieId: string;
};

const MessageForm = ({ cookieId }: MessageFormProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const textArea = textAreaRef.current;

    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = `${textArea.scrollHeight + 4}px`;
    }
  }, [message]);

  const [status, setStatus] = useState("");

  const submit = async () => {
    setStatus("Sending");

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cookieId,
          message,
        }),
      }).then(async (response) => await response.json());

      if (response.success) {
        setStatus("🎉 Delivered!");

        setTimeout(() => {
          redirect("/");
        }, 700);
      } else {
        setStatus(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error(error);

      setStatus("Something went wrong");
    }
  };

  const handleSubmit = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (message) {
      submit();
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();

      submit();
    }
  };

  return (
    <div className="h-dvh w-dvw p-4 flex justify-center items-end">
      <div className="w-full max-w-[600px] font-semibold">
        <div>Send a message!</div>

        <textarea
          ref={textAreaRef}
          rows={1}
          placeholder={"Thoughts, questions, suggestions"}
          value={message}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setMessage(event.target.value);
          }}
          enterKeyHint="send"
          onKeyDown={handleInputKeyDown}
          autoFocus
          className={
            "mt-3 border border-2 border-[rgba(255,255,255,0.33)] focus:border-[rgb(66,133,244)] rounded-md w-full p-3 resize-none"
          }
        />

        <div
          className={`mt-3 rounded-md w-full bg-[rgb(66,133,244)] text-[rgb(255,255,255)] p-3 flex items-center justify-center ${message ? "cursor-pointer opacity-100" : "opacity-33"} transition-all duration-80 transition-discrete`}
          onClick={handleSubmit}
        >
          <div>
            {status ? (
              status === "Sending" ? (
                <div
                  className={`flex h-6 items-center justify-center animate-pulse`}
                >
                  <div className="flex space-x-2">
                    <div className="rounded-full h-2 w-2 bg-[rgb(255,255,255)] animate-bounce [animation-delay:-0.3s]" />

                    <div className="rounded-full h-2 w-2 bg-[rgb(255,255,255)] animate-bounce [animation-delay:-0.15s]" />

                    <div className="rounded-full h-2 w-2 bg-[rgb(255,255,255)] animate-bounce" />
                  </div>
                </div>
              ) : (
                status
              )
            ) : (
              <svg
                viewBox="0 0 19.166 22.4414"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="size-6"
              >
                <g>
                  <rect
                    height="22.4414"
                    opacity="0"
                    width="19.166"
                    x="0"
                    y="0"
                  />
                  <path
                    d="M9.4043 22.4414C10.418 22.4414 11.0977 21.7324 11.0977 20.6777L11.0977 7.67578L10.916 3.27539L9.94336 3.92578L13.3477 7.85156L15.9902 10.4766C16.2949 10.7871 16.6934 11.0039 17.2031 11.0039C18.123 11.0039 18.8145 10.3301 18.8145 9.36914C18.8145 8.91797 18.6387 8.50195 18.2871 8.15039L10.6582 0.509766C10.3418 0.1875 9.86719 0 9.4043 0C8.94141 0 8.46094 0.1875 8.15039 0.509766L0.527344 8.15039C0.181641 8.50195 0 8.91797 0 9.36914C0 10.3301 0.691406 11.0039 1.61133 11.0039C2.12109 11.0039 2.51953 10.7871 2.82422 10.4766L5.45508 7.85156L8.85938 3.92578L7.88672 3.27539L7.70508 7.67578L7.70508 20.6777C7.70508 21.7324 8.39062 22.4414 9.4043 22.4414Z"
                    fillOpacity="0.85"
                  />
                </g>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
