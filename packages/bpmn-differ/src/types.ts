export const PROPERTIES = {
	FLOW_ELEMENTS: "flowElements",
	PLANE_ELEMENTS: "planeElements",
	REFERENCES: "references",
	WAYPOINT: "waypoint",
	PARTICIPANTS: "participants",
	LANE_SETS: "laneSets",
	VALUES: "values",
	DATA_OUTPUT_ASSOCIATIONS: "dataOutputAssociations",
	EVENT_DEFINITIONS: "eventDefinitions",
	ROOT_ELEMENTS: "rootElements",
	WARNINGS: "warnings",
} as const;

export type Properties = (typeof PROPERTIES)[keyof typeof PROPERTIES];

export type BaseElement = {
	$type: string;
	$descriptor: {
		properties: Array<{
			name: string;
			isVirtual: boolean;
			isMany: boolean;
			isReference: boolean;
		}>;
		isGeneric: boolean;
	};
	$instanceOf: string | ((type: string) => boolean);
	participants?: Array<BaseElement & { processRef: string }>;
	attrs?: Record<string, string | null>;
	$parent?: {
		rootElements: Array<
			BaseElement & {
				name: string;
				namespace: string;
				exporter: string;
				exporterVersion: string;
			}
		>;
	};
	id: string;
};
