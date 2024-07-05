import type { BaseElement, DMNModdle } from "./types";

function isAny(element: BaseElement, types: string[]) {
	return types.some((type) => element?.$type === type);
}

function isTracked(element: BaseElement) {
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
	removed = (
		model: DMNModdle,
		property: string,
		element: BaseElement,
		idx: string,
	) => {
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
		newValue?: string,
		oldValue?: string,
	) => {
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
	) => {
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
