import DiffContext from "diffpatch/src/contexts/diff.js";
import type { DiffContext as Context } from "diffpatch/src";
import type { BaseElement } from "./types";

type AugmentedContext = Context & {
	leftType?: string;
	rightType?: string;
	push(child: any, name: string): void;
	children: any[];
	setResult(result: any): {
		exit(): void;
	};
	options: {
		propertyFilter: (name: string, context: AugmentedContext) => boolean;
	};
	leftIsArray: boolean;
	exit(): void;
};

/**
 * A filter that detects and marks `moddle` elements,
 * so we can later calculate change sets for them.
 */
export function moddleFilter(context: AugmentedContext) {
	if (context.left?.$instanceOf) {
		context.leftType = "moddle";
	}

	if (context.right?.$instanceOf) {
		context.rightType = "moddle";
	}
}

moddleFilter.filterName = "moddle";

/**
 * A filter that creates a change set for a given context,
 * using `moddle` infrastructure to figure which changes
 * to actually diff.
 *
 * It ensures that we traverse all relevant relationships
 * and serializes references to prevent endless loops.
 *
 * This filter assumes we don't ever compare `moddle` elements
 * with plain objects.
 */
export function moddleDiffFilter(context: AugmentedContext) {
	if (context.leftIsArray || context.leftType !== "moddle") {
		return;
	}

	const leftProperties = getModdleProperties(context.left);

	const propertyFilter = context.options.propertyFilter;

	if (context.left.$type !== context.right.$type) {
		const child = new DiffContext(context.left.$type, context.right.$type);
		context.push(child, "$type");
	}

	for (const property of leftProperties) {
		const { name, isVirtual, isMany, isReference } = property;

		if (isVirtual || (isMany && isReference)) {
			continue;
		}

		if (propertyFilter && !propertyFilter(name, context)) {
			continue;
		}

		const child = new DiffContext(
			unref(context.left, name),
			unref(context.right, name),
		);
		context.push(child, name);
	}

	const rightProperties = getModdleProperties(context.right);
	for (const property of rightProperties) {
		const { name, isVirtual, isMany, isReference } = property;

		if (isVirtual || (isMany && isReference)) {
			continue;
		}

		if (propertyFilter && !propertyFilter(name, context)) {
			continue;
		}

		if (typeof context.left[name] === "undefined") {
			const child = new DiffContext(undefined, unref(context.right, name));
			context.push(child, name);
		}
	}

	if (!context.children || context.children.length === 0) {
		context.setResult(undefined).exit();
		return;
	}
	context.exit();
}

moddleDiffFilter.filterName = "moddleDiff";

/**
 * Returns the ID to an external reference, or the actual
 * object for containment relationships.
 */
function unref(moddleElement: any, propertyName: string) {
	const { isGeneric, idProperty, propertiesByName } = moddleElement.$descriptor;

	const value = moddleElement[propertyName];

	if (isGeneric) {
		return value;
	}

	const property = propertiesByName[propertyName];

	if (property && !property.isMany && property.isReference) {
		return value && idProperty && `#ref:${value.get(idProperty.name)}`;
	}

	return value;
}

type GenericModdleElement = {
	$type: string;
	metaKey: string;
	metaValue: string;
};

function createGenericProperties(genericModdleElement: GenericModdleElement) {
	return Object.keys(genericModdleElement).flatMap((key) => {
		return key !== "$type" ? { name: key } : [];
	});
}

/**
 * Returns the properties to iterate over when
 * diffing a particular moddle element.
 */
function getModdleProperties(moddleElement: BaseElement): any {
	const { properties, isGeneric } = moddleElement.$descriptor;

	if (isGeneric) {
		return createGenericProperties(
			moddleElement as unknown as GenericModdleElement,
		);
	}
	return properties;
}
