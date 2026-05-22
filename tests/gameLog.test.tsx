import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameLog, formatRunElapsedTime, getTypingState } from "@/components/GameLog";
import { getRecentLogEntries } from "@/lib/incrementalPresentation";

describe("GameLog typing state", () => {
  it("keeps older entries complete and animates only the newest entry", () => {
    expect(getTypingState(["Ancienne entrée", "Nouvelle entrée"], 4)).toEqual([
      { text: "Ancienne entrée", typing: false },
      { text: "Nouv", typing: true },
    ]);
  });

  it("keeps only the latest visible journal lines for the compact panel", () => {
    expect(getRecentLogEntries(["1", "2", "3", "4", "5"], 4)).toEqual(["2", "3", "4", "5"]);
  });

  it("shows the whole newest entry once typing is complete", () => {
    expect(getTypingState(["Nouvelle entrée"], 99)).toEqual([
      { text: "Nouvelle entrée", typing: false },
    ]);
  });

  it("renders the typing cursor only for an unfinished newest entry", () => {
    const html = renderToStaticMarkup(
      <>
        {getTypingState(["Ancienne entrée", "Nouvelle entrée"], 4).map((entry) => (
          <p key={entry.text}>
            {entry.text}
            {entry.typing && <span className="typing-cursor">|</span>}
          </p>
        ))}
      </>,
    );

    expect(html).toContain("typing-cursor");
  });

  it("renders the run timer as a compact pictogram in the journal header", () => {
    const html = renderToStaticMarkup(
      <GameLog entries={["Bienvenue"]} elapsedMs={65_000} />,
    );

    expect(html).toContain("Journal");
    expect(html).toContain("journal-summary-label");
    expect(html).toContain("⏱");
    expect(html).toContain("01:05");
    expect(html).not.toContain(">Temps</span>");
  });

  it("formats elapsed run time for short and long games", () => {
    expect(formatRunElapsedTime(65_000)).toBe("01:05");
    expect(formatRunElapsedTime(3_661_000)).toBe("1:01:01");
  });
});
