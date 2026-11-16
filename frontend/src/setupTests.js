import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
Object.defineProperty(global, "crypto", {
  configurable: true,
  value: { randomUUID: () => `test-${Date.now()}-${Math.random()}` },
});
window.scrollTo = () => {};
