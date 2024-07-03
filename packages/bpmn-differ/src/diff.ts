import type { ChangeHandler } from "./change-handler";
import { Differ } from "./differ";

export function diff(a, b, handler?: ChangeHandler) {
  return new Differ().diff(a, b, handler);
}
