import type { BaseElement, Properties } from "./types";
import { is, isAny } from "./utils";

// Helper functions remain the same
function isDi(element: BaseElement) {
	return isAny(element, ["bpmndi:BPMNEdge", "bpmndi:BPMNShape"]);
}

function getTrackedProcessVisual(processElement: BaseElement) {
	const definitions = processElement.$parent;
	if (!definitions) return;
	const collaboration = definitions.rootElements.find((el) =>
		is(el, "bpmn:Collaboration"),
	);

	// we track the process, too
	if (!collaboration) {
		return {
			element: processElement,
			property: "",
		};
	}
	if (!collaboration.participants) return;
	const participant = collaboration.participants.find(
		(el) => el.processRef === (processElement as unknown as string),
	);

	return (
		participant && {
			element: participant,
			property: "processRef.",
		}
	);
}

function isTracked(element: BaseElement) {
	// a bpmn:FlowElement without visual representation
	if (is(element, "bpmn:DataObject")) {
		return false;
	}

	// track referencing bpmn:Participant instead of
	// bpmn:Process in collaboration diagrams
	if (is(element, "bpmn:Process")) {
		return getTrackedProcessVisual(element);
	}

	const track = isAny(element, [
		"bpmn:Participant",
		"bpmn:Collaboration",
		"bpmn:FlowElement",
		"bpmn:SequenceFlow",
		"bpmn:MessageFlow",
		"bpmn:Participant",
		"bpmn:Lane",
		"bpmn:DataAssociation",
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
		{
			model: BaseElement;
			attrs: Record<
				string,
				{
					oldValue?: string | null | BaseElement;
					newValue?: string | null | BaseElement;
				}
			>;
		}
	>;
	removed: Record<string, BaseElement>;
	added: Record<string, BaseElement>;
	layoutChanged: Record<string, BaseElement>;
};

export class ChangeHandler {
	_layoutChanged: Record<string, BaseElement>;
	_changed: Record<
		string,
		{
			model: BaseElement;
			attrs: Record<
				string,
				{
					oldValue?: string | null | BaseElement;
					newValue?: string | null | BaseElement;
				}
			>;
		}
	>;
	_removed: Record<string, BaseElement>;
	_added: Record<string, BaseElement>;
	constructor() {
		this._layoutChanged = {};
		this._changed = {};
		this._removed = {};
		this._added = {};
	}

	getResults(): Results {
		return {
			changed: this._changed,
			removed: this._removed,
			added: this._added,
			layoutChanged: this._layoutChanged,
		};
	}

	removed(model: any, property: Properties, element: BaseElement, idx: number) {
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
					`${tracked.property + property}[${idx}]` as Properties,
					null,
					element,
				);
			} else if (isDi(model) && property === "waypoint") {
				this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
			}
		}
	}

	changed(
		model: any,
		property: Properties,
		newValue?: string | null | BaseElement,
		oldValue?: string | null | BaseElement,
	) {
		const tracked = isTracked(model);

		if (isDi(model)) {
			this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
		} else if (tracked) {
			let changed = this._changed[tracked.element.id];

			if (!changed) {
				changed = this._changed[tracked.element.id] = {
					model,
					attrs: {},
				};
			}

			if (oldValue || newValue) {
				changed.attrs[property] = { oldValue, newValue };
			}
		}
	}

	added(model: any, property: Properties, element: BaseElement, idx: number) {
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
					`${tracked.property + property}[${idx}]` as Properties,
					element,
					null,
				);
			} else if (isDi(model) && property === "waypoint") {
				this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
			}
		}
	}
}
