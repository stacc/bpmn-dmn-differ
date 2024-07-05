function is(element, type: string) {
	return element?.$type === type;
}

function isAny(element, types: Array<string>) {
	return types.some((type) => is(element, type));
}

function isDi(element) {
	return isAny(element, ["bpmndi:BPMNEdge", "bpmndi:BPMNShape"]);
}

function getTrackedProcessVisual(processElement) {
	const definitions = processElement.$parent;

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

	const participant = collaboration.participants.find(
		(el) => el.processRef === processElement,
	);

	return (
		participant && {
			element: participant,
			property: "processRef.",
		}
	);
}

function isTracked(element) {
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
		"bpmn:TimerEventDefinition",
	]);

	if (track) {
		return {
			element: element,
			property: "",
		};
	}
}

export class ChangeHandler {
	_layoutChanged: Record<string, any>;
	_changed: Record<string, any>;
	_removed: Record<string, any>;
	_added: Record<string, any>;
	constructor() {
		this._layoutChanged = {};
		this._changed = {};
		this._removed = {};
		this._added = {};
	}
	removed = (model, property: string, element, idx: string) => {
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
		if (isDi(model) && property === "waypoint") {
			this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
		}
	};
	changed = (
		model,
		property: string,
		newValue?: string | null,
		oldValue?: string | null,
	) => {
		if (isDi(model)) {
			this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
		} else {
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
		}
	};
	added = (model, property: string, element, idx: string) => {
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
		if (isDi(model) && property === "waypoint") {
			this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
		}
	};
	moved = (model, _property: string, _oldIndex: number, _newIndex: number) => {
		// noop
	};
}
