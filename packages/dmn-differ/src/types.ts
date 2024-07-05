export type BaseElement = {
	$type: string;
	id: string;
};
export type DMNModdle = {
	rootElement: BaseElement & {
		name: string;
		namespace: string;
		exporter: string;
		exporterVersion: string;
	};
	elementsById: {
		[key: string]: BaseElement & {
			name: string;
			namespace: string;
			exporter: string;
			exporterVersion: string;
		};
	};
	references: Array<{
		element: Record<string, string>;
		property: string;
		id: string;
	}>;
	warnings: Array<never>;
};
