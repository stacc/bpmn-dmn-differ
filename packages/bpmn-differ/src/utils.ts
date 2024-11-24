import type { BaseElement } from "./types";

/**
 * Checks if an element is of a specific type
 */
export function is(element: BaseElement, type: string): boolean {
	if (typeof element.$instanceOf === "function") {
		return element.$instanceOf(type);
	}
	return element.$instanceOf === type;
}

/**
 * Checks if an element is any of the given types
 */
export function isAny(element: BaseElement, types: string[]): boolean {
	return types.some((type) => is(element, type));
}
