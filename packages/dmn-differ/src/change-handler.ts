function is(element, type) {
  return element.$instanceOf(type);
}

function isAny(element, types) {
  return types.some((type) => is(element, type));
}

function isDi(element) {
  return isAny(element, ["dmndi:DMNEdge", "dmndi:DMNShape"]);
}

function isTracked(element) {
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
  removed = (model, property, element, idx) => {
    var tracked;
    if ((tracked = isTracked(element))) {
      if (!this._removed[tracked.element.id]) {
        this._removed[tracked.element.id] = element;
      }
    } else if ((tracked = isTracked(model))) {
      this.changed(
        tracked.element,
        tracked.property + property + "[" + idx + "]",
        null,
        element
      );
    } else if (isDi(model) && property === "waypoint") {
      this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
    }
  };
  changed = (model, property, newValue, oldValue) => {
    let tracked;

    if (isDi(model)) {
      this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
    } else if ((tracked = isTracked(model))) {
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
  added = (model, property, element, idx) => {
    var tracked;

    if ((tracked = isTracked(element))) {
      if (!this._added[tracked.element.id]) {
        this._added[tracked.element.id] = element;
      }
    } else if ((tracked = isTracked(model))) {
      this.changed(
        tracked.element,
        tracked.property + property + "[" + idx + "]",
        element,
        null
      );
    } else if (isDi(model) && property === "waypoint") {
      this._layoutChanged[model.bpmnElement.id] = model.bpmnElement;
    }
  };
  moved = (model, property, oldIndex, newIndex) => {
    // noop
  };
}
