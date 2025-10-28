//

export const slugMaker = (...rest: string[]): string =>
  rest.join(" ").trim().toLowerCase().split(/\s+/).join("-");
