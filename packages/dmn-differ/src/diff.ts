import type { ChangeHandler } from "./change-handler.js";
import { Differ } from "./differ.js";

export function diff(a, b, handler: ChangeHandler) {
  return new Differ().diff(a, b, handler);
}
