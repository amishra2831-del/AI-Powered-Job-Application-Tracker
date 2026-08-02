import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useDarkMode } from "../hooks/useDarkMode.js";

const KanbanMockup = () => {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const wrapRef = useRef(null);
  const hasAnimated = useRef(false);
  const dragSource = useRef(null);

  const initialColumns = [
    {
      label: "Saved",
      color: "#888780",
      cards: [
        {
          company: "Stripe",
          role: "Frontend Engineer",
          badge: "Remote",
          badgeType: "remote",
          score: "92%",
          scoreHigh: true,
        },
        {
          company: "Figma",
          role: "SWE Intern",
          badge: "On-site",
          badgeType: "onsite",
          score: "74%",
          scoreHigh: false,
        },
      ],
    },
    {
      label: "Applied",
      color: "#185fa5",
      cards: [
        {
          company: "Vercel",
          role: "Full Stack Dev",
          badge: "Remote",
          badgeType: "remote",
          score: "88%",
          scoreHigh: true,
          date: "Apr 2",
        },
        {
          company: "Linear",
          role: "Backend Engineer",
          badge: "Hybrid",
          badgeType: "hybrid",
          score: "71%",
          scoreHigh: false,
          date: "Apr 5",
        },
        {
          company: "Loom",
          role: "React Developer",
          badge: "Remote",
          badgeType: "remote",
          score: "67%",
          scoreHigh: false,
          date: "Apr 7",
        },
      ],
    },
    {
      label: "Interview",
      color: "#854f0b",
      cards: [
        {
          company: "Notion",
          role: "Product Engineer",
          badge: "Hybrid",
          badgeType: "hybrid",
          score: "85%",
          scoreHigh: true,
          date: "Apr 12",
        },
        {
          company: "Supabase",
          role: "Node.js Engineer",
          badge: "Remote",
          badgeType: "remote",
          score: "91%",
          scoreHigh: true,
          date: "Apr 15",
        },
      ],
    },
    {
      label: "Offer",
      color: "#0f6e56",
      cards: [
        {
          company: "Resend",
          role: "Software Engineer",
          badge: "Remote",
          badgeType: "remote",
          score: "96%",
          scoreHigh: true,
          date: "Offer received!",
        },
      ],
    },
    {
      label: "Rejected",
      color: "#a32d2d",
      cards: [
        {
          company: "Cloudflare",
          role: "Systems Engineer",
          badge: "On-site",
          badgeType: "onsite",
          score: "58%",
          scoreHigh: false,
          date: "Apr 1",
        },
      ],
    },
  ];

  const [columns, setColumns] = useState(initialColumns);

  const badgeStyles = {
    remote:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    onsite: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    hybrid:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  };

  const allCards = columns.flatMap((col, colIdx) =>
    col.cards.map((card, cardIdx) => ({
      ...card,
      id: `${col.label}-${card.company}`,
      stableId: card.company,
      delay: (colIdx * col.cards.length + cardIdx) * 80,
    })),
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          allCards.forEach(({ id, stableId, delay }) => {
            setTimeout(
              () => {
                setVisibleCards((prev) => new Set([...prev, id, stableId]));
              },
              300 + delay * 3,
            );
          });
        }
      },
      { threshold: 0.15 },
    );
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [allCards]);

  const handleDragStart = (colIdx, cardIdx) => {
    dragSource.current = { colIdx, cardIdx }; // ✅ FIX
  };

  const handleDrop = (toColIdx) => {
    if (!dragSource.current) return;
    const { colIdx: fromColIdx, cardIdx } = dragSource.current;

    if (fromColIdx === toColIdx) return;

    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));
      const [moved] = next[fromColIdx].cards.splice(cardIdx, 1);
      next[toColIdx].cards.push(moved);

      // ✅ ensure moved card is visible in new column
      const newId = moved.company;
      setTimeout(() => {
        setVisibleCards((prev) => new Set([...prev, newId]));
      }, 0);

      return next;
    });

    dragSource.current = null;
  };

  return (
    <div
      ref={wrapRef}
      className="w-full mt-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-4 overflow-x-auto"
    >
      <div className="flex gap-3 min-w-[640px]">
        {columns.map((col, colIdx) => (
          <div
            key={col.label}
            className="flex-1 min-w-[130px] flex flex-col gap-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(colIdx)}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: col.color }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {col.label}
              </span>
              <span className="text-[9px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 rounded-full px-1.5 py-0.5">
                {col.cards.length}
              </span>
            </div>

            {col.cards.map((card, cardIdx) => {
              const id = `${col.label}-${card.company}`;
              const stableId = card.company;
              const isVisible =
                visibleCards.has(id) || visibleCards.has(stableId);

              return (
                <div
                  key={card.company + card.role}
                  draggable
                  onDragStart={() => handleDragStart(colIdx, cardIdx)}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(16px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    cursor: "grab",
                  }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 flex flex-col gap-1.5"
                >
                  <p className="text-[11px] font-semibold text-gray-900 dark:text-white leading-none">
                    {card.company}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                    {card.role}
                  </p>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-0.5" />
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badgeStyles[card.badgeType]}`}
                    >
                      {card.badge}
                    </span>
                    <span
                      className={`text-[9px] font-semibold ${
                        card.scoreHigh
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {card.score}
                    </span>
                  </div>
                  {card.date && (
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-none">
                      {card.date}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const useTypewriter = (lines, speed = 50) => {
  const [displayed, setDisplayed] = useState({ line: 0, chars: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const { line, chars } = displayed;
    let t;
    if (chars < lines[line].length) {
      t = setTimeout(() => {
        setDisplayed({ line, chars: chars + 1 });
      }, speed);
      return () => clearTimeout(t);
    } else if (line < lines.length - 1) {
      t = setTimeout(() => {
        setDisplayed({ line: line + 1, chars: 0 });
      }, 300);
      return () => clearTimeout(t);
    } else {
      t = setTimeout(() => setDone(true), 0);
    }

    return () => clearTimeout(t);
  }, [displayed, done, lines, speed]);

  return { displayed, done };
};

const Landing = () => {
  const { user } = useAuth();
  const { isDark, toggle } = useDarkMode();

  const lines = ["organized", "and intelligent"];
  const { displayed, done } = useTypewriter(lines);

  const typedText = lines.slice(0, displayed.line + 1).map((line, i) => {
    if (i < displayed.line) return line;
    return line.slice(0, displayed.chars);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── Minimal topbar ── */}
      <header className="h-16 border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Job Tracker
        </span>
        {user ? (
          <Link
            to="/board"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Board →
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started →
            </Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          AI-Powered Job Search Tracker
        </div>

        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Job Tracker
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6 min-h-[120px] sm:min-h-[144px]">
          Your job search,{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-blue-600">{typedText[0]}</span>
            {typedText[0] && (
              <span className="absolute inset-x-0 bottom-0 h-3 bg-blue-200 dark:bg-blue-800/60 blur-md rounded-full z-0" />
            )}
          </span>
          {typedText[1] !== undefined && (
            <>
              <br />
              {typedText[1]}
            </>
          )}
          {!done && (
            <span className="inline-block w-[3px] h-[0.85em] bg-blue-600 align-middle ml-1 animate-pulse" />
          )}
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Track every application on a visual kanban board. Let AI parse job
          descriptions automatically and score your resume against every role
          you apply to.
        </p>

        <div className="flex items-center justify-center gap-4">
          {user ? (
            <Link
              to="/board"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              Go to Board →
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
              >
                Get Started →
              </Link>
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>

        <KanbanMockup />

        {/* ── Stats row ── */}
        <div className="flex items-center justify-center gap-8 mt-14">
          {[
            { value: "5", label: "Pipeline stages" },
            { value: "✦ AI", label: "Job description parser", accent: true },
            { value: "100%", label: "Resume match scoring" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className={`text-2xl font-bold mb-0.5 ${
                  stat.accent
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-gray-100 dark:border-gray-800" />
      </div>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Everything you need to land the job
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Built for developers who take their job search seriously
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Visual Kanban Board
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Drag and drop applications across Saved, Applied, Interview, Offer
              and Rejected stages. See your entire pipeline at a glance.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              AI Job Parser
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Paste any job description and AI automatically extracts company,
              role, location, salary and job type, no manual typing needed.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Resume Match Score
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Upload your resume once. Get an AI-generated match score for every
              application with specific strengths, gaps and improvement tips.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-gray-100 dark:border-gray-800" />
      </div>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to take control of your job search?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Free to use. Built to simplify your job search.
          </p>
          {user ? (
            <Link
              to="/board"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              Go to Board →
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              Get Started →
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            Apply<span className="text-blue-600">Staq</span>
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Built by{" "}
              <a
                href="https://github.com/S-undas"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors"
              >
                S-undas
              </a>
            </p>
            {/* ── Theme toggle pill ── */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => {
                  if (isDark) toggle();
                }}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                  !isDark
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
                title="Light mode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707.707M6.343 6.343l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (!isDark) toggle();
                }}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                  isDark
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Dark mode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;