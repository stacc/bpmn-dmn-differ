// @ts-nocheck
import type { BaseElement, DMNModdle } from "./types";

function isAny(element: BaseElement | DMNModdle, types: string[]) {
	return types.some((type) => element?.$type === type);
}

function isTracked(element: BaseElement | DMNModdle) {
	const track = isAny(element, [
		"dmn:Decision",
		"dmn:DecisionTable",
		"dmn:DecisionRule",
		"dmn:UnaryTests",
		"dmn:LiteralExpression",
		"dmn:InputClause",
		"dmn:OutputClause",
	]);

	if (track) {
		return {
			element: element,
			property: "",
		};
	}
}

export type Results = {
	changed: Record<
		string,
		BaseElement & {
			attrs: Record<
				string,
				{ oldValue: string | null; newValue: string | null }
			>;
		}
	>;
	removed: Record<string, BaseElement>;
	added: Record<string, BaseElement>;
};

export class ChangeHandler {
	_changed: Record<
		string,
		BaseElement & {
			attrs: Record<
				string,
				{ oldValue: string | null; newValue: string | null }
			>;
		}
	>;
	_removed: Record<string, BaseElement>;
	_added: Record<string, BaseElement>;
	constructor() {
		this._changed = {};
		this._removed = {};
		this._added = {};
	}

	getResults(): Results {
		return {
			changed: this._changed,
			removed: this._removed,
			added: this._added,
		};
	}

	removed = (
		model: DMNModdle,
		property: string,
		element: BaseElement,
		idx: string,
	): void => {
		let tracked = isTracked(element);
		if (tracked) {
			if (!this._removed[tracked.element.id]) {
				this._removed[tracked.element.id] = element;
			}
		} else {
			tracked = isTracked(model);
			if (tracked) {
				this.changed(
					tracked.element,
					`${tracked.property + property}[${idx}]`,
					null,
					element,
				);
			}
		}
	};

	changed = (
		model: DMNModdle | BaseElement,
		property: string,
		newValue?: string | null | BaseElement,
		oldValue?: string,
	): void => {
		const tracked = isTracked(model);
		if (tracked) {
			let changed = this._changed[tracked.element.id];
			if (!changed) {
				changed = this._changed[tracked.element.id] = {
					model: model,
					attrs: {},
				};
			}
			if (oldValue !== undefined || newValue !== undefined) {
				changed.attrs[property] = { oldValue, newValue };
			}
		}
	};
	added = (
		model: DMNModdle,
		property: string,
		element: BaseElement,
		idx: string,
	): void => {
		let tracked = isTracked(element);
		if (tracked) {
			if (!this._added[tracked.element.id]) {
				this._added[tracked.element.id] = element;
			}
		} else {
			tracked = isTracked(model);
			if (tracked) {
				this.changed(
					tracked.element,
					`${tracked.property + property}[${idx}]`,
					element,
					null,
				);
			}
		}
	};
}
