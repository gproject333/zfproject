import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OliveLogo from "./OliveLogo";

describe("OliveLogo", () => {
  it("renders an svg with default class", () => {
    const { container } = render(<OliveLogo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("class", "w-full h-full");
  });

  it("applies a custom className", () => {
    const { container } = render(<OliveLogo className="size-8" />);
    expect(container.querySelector("svg")).toHaveAttribute("class", "size-8");
  });
});
