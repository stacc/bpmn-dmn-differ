import { forEach, reduce, isArray } from "min-dash";
import { DiffPatcher } from "diffpatch";
import { ChangeHandler } from "./change-handler";

export class Differ {
	createDiff(a, b) {
		// create a configured instance, match objects by name
		const diffpatcher = new DiffPatcher({
			objectHash: (obj) => obj.id || JSON.stringify(obj),
			propertyFilter: (name) => name !== "$instanceOf",
		});
		return diffpatcher.diff(a, b);
	}
	diff(a, b, handler = new ChangeHandler()) {
		function walk(diff, model) {
			forEach(diff, (d, key) => {
				if (d._t !== "a" && isArray(d)) {
					// take into account that collection properties are lazily
					// initialized; this means that adding to an empty collection
					// looks like setting an undefined variable to []
					//
					// ensure we detect this case and change it to an array diff
					if (isArray(d[0])) {
						d = reduce(
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

						idx = Number.parseInt(removed ? idx.slice(1) : idx, 10);

						if (added || (removed && !moved)) {
							handler[removed ? "removed" : "added"](model, key, val[0], idx);
						} else {
							walk(val, model[key][idx]);
						}
					});
				} else {
					if (isArray(d)) {
						handler.changed(model, key, d[0], d[1]);
					} else {
						handler.changed(model, key);
						walk(d, model[key]);
					}
				}
			});
		}

		const diff = this.createDiff(a, b);

		walk(diff, b, handler);

		return handler;
	}
}
