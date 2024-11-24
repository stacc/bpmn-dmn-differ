import type { ChangeHandler, Results } from "./change-handler";
import { Differ } from "./differ";

export function diff(a: any, b: any, handler?: ChangeHandler): Results {
	return new Differ().diff(a, b, handler).getResults();
}
