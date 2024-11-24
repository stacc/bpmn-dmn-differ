// @ts-nocheck
import { forEach, reduce, isArray } from "min-dash";
import { DiffPatcher, type Delta } from "diffpatch";
import { ChangeHandler } from "./change-handler";
import type { BaseElement, DMNModdle } from "./types";

export class Differ {
	createDiff(a: DMNModdle, b: DMNModdle): Delta | undefined {
		// create a configured instance, match objects by name
		const diffpatcher = new DiffPatcher({
			objectHash: (obj: BaseElement | Record<string, undefined>) =>
				obj.id || JSON.stringify(obj),
			propertyFilter: (name: string) => name !== "$instanceOf",
		});

		return diffpatcher.diff(a, b);
	}
	diff(
		a: DMNModdle,
		b: DMNModdle,
		handler: ChangeHandler = new ChangeHandler(),
	): ChangeHandler {
		function walk(diff: Delta | undefined, model: DMNModdle): ChangeHandler {
			forEach(diff, (d, key) => {
				if (d._t !== "a" && isArray(d)) {
					// take into account that collection properties are lazily
					// initialized; this means that adding to an empty collection
					// looks like setting an undefined variable to []
					//
					// ensure we detect this case and change it to an array diff
					if (isArray(d[0])) {
						const modifiedD = reduce(
							d[0],
							(newDelta, element, idx) => {
								const prefix = d.length === 3 ? "_" : "";

								newDelta[prefix + idx] = [element];

								return newDelta;
							},
							{ _t: "a" },
						);
					}
				}

				// is array
				if (d._t === "a") {
					forEach(d, (val, idx) => {
						if (idx === "_t") {
							return;
						}

						const removed = /^_/.test(idx);
						const added = !removed && isArray(val);
						const moved = removed && val[0] === "";

						const position = Number.parseInt(removed ? idx.slice(1) : idx, 10);

						if (added || (removed && !moved)) {
							handler[removed ? "removed" : "added"](
								model,
								key,
								val[0],
								position,
							);
						} else if (moved) {
							return;
						} else {
							walk(val, model[key][idx]);
						}
					});
				} else {
					if (isArray(d)) {
						// issue: returns 3 values in array and wrong order (left/right)
						if (d.length === 3 && d[1] === 0 && d[2] === 2) {
							handler.changed(model, key, undefined, d[0]);
						} else if (d.length === 1) {
							handler.changed(model, key, d[0], undefined);
						} else {
							handler.changed(model, key, d[1], d[0]);
						}
					} else {
						handler.changed(model, key);
						walk(d, model[key]);
					}
				}
			});
		}

		const diff = this.createDiff(a, b);

		trackAdditionalProperties(handler, a, b, "hitPolicy");

		walk(diff, b);

		return handler;
	}
}

function trackAdditionalProperties(
	handler: ChangeHandler,
	a: DMNModdle,
	b: DMNModdle,
	key: string,
) {
	const hitPolicyChangesLeft = findValues(a, key);
	if (hitPolicyChangesLeft.length === 0) {
		const hitPolicyChangesRight = findValues(b, key);

		if (hitPolicyChangesRight.length > 0) {
			const diffModel = hitPolicyChangesRight[0];

			let defaultValue = undefined;

			if (key === "hitPolicy") {
				defaultValue = "UNIQUE";
			}

			handler.changed(
				diffModel.model,
				diffModel.key,
				diffModel.value,
				defaultValue,
			);
		}
	}
}

function findValues(object: BaseElement, key: string) {
	const values = new Array();

	function find(object: BaseElement, key: string) {
		let value: Array<{
			id: string;
			value: string;
			model: BaseElement;
			key: string;
		}> = [];

		Object.keys(object).some((k) => {
			if (k === key) {
				value = object[k];
				values.push({
					id: object.id,
					value: value,
					model: object,
					key: key,
				});
				return true;
			}

			if (object[k] && typeof object[k] === "object") {
				value = find(object[k], key);
				if (value !== undefined) {
					return true;
				}
				return false;
			}
		});

		return value;
	}

	find(object, key);

	return values;
}
