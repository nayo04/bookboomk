import React, { useEffect, useRef, useState } from 'react';
import { Twitter, ExternalLink, RefreshCw } from 'lucide-react';

interface TwitterEmbedProps {
  tweetId: string;
  url: string;
  title?: string;
}

declare global {
  interface Window {
    twttr?: {
      ready?: (callback: (twttr: any) => void) => void;
      widgets?: {
        createTweet: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
    };
  }
}

export const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ tweetId, url, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTokenRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = ++renderTokenRef.current;

    const renderTweet = () => {
      if (!containerRef.current) return;

      try {
        if (!window.twttr) {
          if (isMounted && token === renderTokenRef.current) {
            setError(true);
            setLoading(false);
          }
          return;
        }

        const create = () => {
          if (!containerRef.current || !window.twttr?.widgets?.createTweet) {
            if (isMounted && token === renderTokenRef.current) {
              setError(true);
              setLoading(false);
            }
            return;
          }

          containerRef.current.innerHTML = '';
          setLoading(true);
          setError(false);

          window.twttr.widgets
            .createTweet(tweetId, containerRef.current, {
              theme: 'light',
              align: 'center',
              conversation: 'none',
            })
            .then((el) => {
              if (isMounted && token === renderTokenRef.current) {
                setLoading(false);
                if (containerRef.current && containerRef.current.children.length > 1) {
                  while (containerRef.current.children.length > 1) {
                    containerRef.current.removeChild(containerRef.current.lastChild!);
                  }
                }
                if (!el) {
                  setError(true);
                }
              }
            })
            .catch(() => {
              if (isMounted && token === renderTokenRef.current) {
                setError(true);
                setLoading(false);
              }
            });
        };

        if (typeof window.twttr.ready === 'function') {
          window.twttr.ready(() => create());
        } else {
          create();
        }
      } catch {
        if (isMounted && token === renderTokenRef.current) {
          setError(true);
          setLoading(false);
        }
      }
    };

    const loadTwitterScript = () => {
      if (window.twttr?.widgets?.createTweet) {
        renderTweet();
        return;
      }

      const existingScript = document.getElementById('twitter-wjs');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'twitter-wjs';
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = () => {
          if (isMounted) renderTweet();
        };
        script.onerror = () => {
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        };
        document.body.appendChild(script);
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.twttr?.widgets?.createTweet) {
            clearInterval(interval);
            if (isMounted) renderTweet();
          } else if (attempts > 25) {
            clearInterval(interval);
            if (isMounted) {
              setError(true);
              setLoading(false);
            }
          }
        }, 200);
      }
    };

    try {
      loadTwitterScript();
    } catch {
      setError(true);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [tweetId]);

  return (
    <div className="w-full bg-slate-900/5 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
          <span className="text-sm font-medium">트윗 불러오는 중...</span>
        </div>
      )}

      {error ? (
        <div className="text-center p-6 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-full max-w-md">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-full">
              <Twitter className="w-6 h-6" />
            </div>
          </div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">
            {title || '트위터(X) 게시물'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            임베드 차단 또는 네트워크 연결 상태로 인해 미리보기를 바로 표시할 수 없습니다.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            트위터(X)에서 직접 보기 <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div ref={containerRef} className="w-full flex justify-center max-w-lg min-h-[180px]" />
      )}
    </div>
  );
};
