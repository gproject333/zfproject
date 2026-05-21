import type { ComponentProps } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => useAuthMock(),
}));

// CountUp animates on scroll — irrelevant here, and keeps jsdom simple.
vi.mock("./CountUp", () => ({ default: () => null }));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import FeaturesSection from "./FeaturesSection";

/**
 * The three incubation-track cards each carry a "تقديم طلب" CTA. The CTA
 * must deep-link a signed-in user straight to the matching submission
 * form — only a guest should be routed to register/login.
 */
describe("FeaturesSection track cards", () => {
  function trackHrefs(container: HTMLElement): string[] {
    return [...container.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href") ?? "")
      .filter((h) => h === "/register" || h.startsWith("/student/new/"));
  }

  it("routes signed-out visitors to /register", () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: false });
    const { container } = render(<FeaturesSection />);
    expect(trackHrefs(container)).toEqual([
      "/register",
      "/register",
      "/register",
    ]);
  });

  it("routes signed-in users straight to the matching submission form", () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: true });
    const { container } = render(<FeaturesSection />);
    expect(trackHrefs(container)).toEqual([
      "/student/new/entrepreneurial_idea",
      "/student/new/it_graduation",
      "/student/new/university_entrepreneurial",
    ]);
  });
});
