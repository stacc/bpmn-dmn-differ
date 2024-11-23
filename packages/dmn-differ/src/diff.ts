import type { ChangeHandler, Results } from "./change-handler.js";
import { Differ } from "./differ.js";
import type { DMNModdle } from "./types.js";

export function diff(
	a: DMNModdle,
	b: DMNModdle,
	handler?: ChangeHandler,
): Results {
	return new Differ().diff(a, b, handler).getResults();
}
