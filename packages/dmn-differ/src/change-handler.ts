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
	_changed: Record<string, any>;
	_removed: Record<string, any>;
	_added: Record<string, any>;
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
		let tracked;
		if ((tracked = isTracked(element))) {
			if (!this._removed[tracked.element.id]) {
				this._removed[tracked.element.id] = element;
			}
		} else if ((tracked = isTracked(model))) {
			this.changed(
				tracked.element,
				`${tracked.property + property}[${idx}]`,
				null,
				element,
			);
		}
	};

	changed = (
		model: DMNModdle,
		property: string,
		newValue?: string,
		oldValue?: string,
	) => {
		let tracked;
		if ((tracked = isTracked(model))) {
			let changed = this._changed[tracked.element.id];

			if (!changed) {
				changed = this._changed[tracked.element.id] = {
					model: model,
					attrs: {},
				};
			}

			if (oldValue !== undefined || newValue !== undefined) {
				changed.attrs[property] = { oldValue: oldValue, newValue: newValue };
			}
		}
	};
	added = (
		model: DMNModdle,
		property: string,
		element: BaseElement,
		idx: string,
	) => {
		let tracked;

		if ((tracked = isTracked(element))) {
			if (!this._added[tracked.element.id]) {
				this._added[tracked.element.id] = element;
			}
		} else if ((tracked = isTracked(model))) {
			this.changed(
				tracked.element,
				`${tracked.property + property}[${idx}]`,
				element,
				null,
			);
		}
	};
}
