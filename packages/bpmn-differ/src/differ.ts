import { forEach, reduce, isArray } from "min-dash";
import { DiffPatcher, type Delta } from "diffpatch";
import { ChangeHandler } from "./change-handler";
import { moddleFilter, moddleDiffFilter } from "./filters.js";
import type { Properties } from "./types.js";

interface TypedDiffPatcher extends DiffPatcher {
	processor: {
		pipe: (name: string) => {
			after: (name: string, fn: any) => void;
		};
	};
}

export class Differ {
	createDiff(a: any, b: any): Delta | undefined {
		// create a configured instance, match objects by name
		const diffpatcher = new DiffPatcher({
			objectHash: (
				obj: Record<
					string,
					{
						id: string;
					}
				>,
			) => obj.id || JSON.stringify(obj),
			propertyFilter: (name: string) => name !== "$instanceOf",
		}) as TypedDiffPatcher;

		// tag <moddle> elements as appropriate
		diffpatcher.processor.pipe("diff").after("trivial", moddleFilter);

		// handle moddle elements
		diffpatcher.processor.pipe("diff").after("objects", moddleDiffFilter);

		return diffpatcher.diff(a, b);
	}

	diff(
		a: any,
		b: any,
		handler: ChangeHandler = new ChangeHandler(),
	): ChangeHandler {
		const walk = (diff: any, model: any) => {
			forEach(diff, (d: any, key: Properties) => {
				if (d._t !== "a" && isArray(d)) {
					// take into account that collection properties are lazily
					// initialized; this means that adding to an empty collection
					// looks like setting an undefined variable to []
					//
					// ensure we detect this case and change it to an array diff
					if (isArray(d[0])) {
						d = reduce(
							d[0],
							(
								newDelta: { _t: string; [key: string]: any },
								element: unknown,
								idx,
							) => {
								const prefix = (d as any[]).length === 3 ? "_" : "";

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
						const moved = removed && Array.isArray(val) && val[0] === "";

						const newIdx = Number.parseInt(removed ? idx.slice(1) : idx, 10);

						if (added || (removed && !moved)) {
							handler[removed ? "removed" : "added"](
								model,
								key,
								Array.isArray(val) ? val[0] : undefined,
								newIdx,
							);
						} else if (moved) {
							return;
						} else {
							walk(val, model[key][newIdx]);
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
		};

		const diff = this.createDiff(a, b);

		walk(diff, b);

		return handler;
	}
}
