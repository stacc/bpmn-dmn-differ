import type { ChangeHandler } from "./change-handler.js";
import { Differ } from "./differ.js";
import type { DMNModdle } from "./types.js";

export function diff(a: DMNModdle, b: DMNModdle, handler?: ChangeHandler) {
	return new Differ().diff(a, b, handler);
}
