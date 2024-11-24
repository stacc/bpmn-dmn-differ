import { expect, describe, it, assert } from "vitest";
import DmnModdle from "dmn-moddle";
import { camundaScheme, diff } from "../../src";
import { ChangeHandler } from "../../src/change-handler";
import { readFileSync } from "node:fs";

describe("diffing", () => {
	it("should discover table add", async () => {
		const results = await testDmnDiff(
			"test/fixtures/add-table/before.dmn",
			"test/fixtures/add-table/after.dmn",
		);
		assert.containsAllKeys(results.added, ["Decision_2"]);
		expect(results.removed).toEqual({});
		expect(results.changed).toEqual({});
	});

	it("should discover table field change", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-table/before.dmn",
			"test/fixtures/change-table/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"LiteralExpression_11bnf50",
			"UnaryTests_16zmfgt",
		]);
		expect(results.changed.LiteralExpression_11bnf50.attrs).toEqual({
			text: { oldValue: "ausgabe2", newValue: "ausgabe2-change" },
		});
		expect(results.changed.UnaryTests_16zmfgt.attrs).toEqual({
			text: { oldValue: "eingabe1", newValue: "eingabe1-change" },
		});
	});

	it("should discover table drop", async () => {
		const results = await testDmnDiff(
			"test/fixtures/drop-table/before.dmn",
			"test/fixtures/drop-table/after.dmn",
		);
		expect(results.added).toEqual({});
		assert.containsAllKeys(results.removed, ["Decision_2"]);
		expect(results.changed).toEqual({});
	});

	it("should discover change hit policy", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-policy/before.dmn",
			"test/fixtures/change-policy/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"DecisionTable_0zjc24h",
		]);
		expect(results.changed.DecisionTable_0zjc24h.attrs).toEqual({
			hitPolicy: { oldValue: "FIRST", newValue: "COLLECT" },
		});
	});

	it("should discover change hit policy unique", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-policy-unique/before.dmn",
			"test/fixtures/change-policy-unique/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, ["DecisionTable_0zjc24h"]);
		expect(results.changed.DecisionTable_0zjc24h.attrs).toEqual({
			hitPolicy: { oldValue: "UNIQUE", newValue: "FIRST" },
		});
	});

	it("should discover change hit policy unique (reversed)", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-policy-unique/after.dmn",
			"test/fixtures/change-policy-unique/before.dmn",
		);

		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"DecisionTable_0zjc24h",
			"Decision_1",
		]);
		expect(results.changed.Decision_1.attrs).toEqual({});
		expect(results.changed.DecisionTable_0zjc24h.attrs).toEqual({
			hitPolicy: { oldValue: "FIRST", newValue: "UNIQUE" },
		});
	});

	it("should discover change hit policy aggregation", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-policy-agg/before.dmn",
			"test/fixtures/change-policy-agg/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"DecisionTable_0zjc24h",
		]);
		expect(results.changed.DecisionTable_0zjc24h.attrs).toEqual({
			aggregation: { oldValue: undefined, newValue: "SUM" },
			hitPolicy: { oldValue: "PRIORITY", newValue: "COLLECT" },
		});
	});

	it("should discover change hit policy aggregation (reverse)", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-policy-agg/after.dmn",
			"test/fixtures/change-policy-agg/before.dmn",
		);

		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"DecisionTable_0zjc24h",
		]);
		expect(results.changed.DecisionTable_0zjc24h.attrs).toEqual({
			aggregation: { oldValue: "SUM", newValue: 0 },
			hitPolicy: { oldValue: "COLLECT", newValue: "PRIORITY" },
		});
	});

	it("should discover change input variables", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-input-var/before.dmn",
			"test/fixtures/change-input-var/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, ["Decision_1", "Input_1"]);
		expect(results.changed.Input_1.attrs).toEqual({
			inputVariable: { oldValue: undefined, newValue: "inputVar" },
		});
	});

	it("should discover change columns", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-columns/before.dmn",
			"test/fixtures/change-columns/after.dmn",
		);
		assert.containsAllKeys(results.added, [
			"InputClause_0j51xwh",
			"LiteralExpression_0wnqqx2",
			"OutputClause_19qooh4",
			"UnaryTests_1v6m01o",
		]);
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, ["Decision_1"]);
	});

	it("should discover add and remove row", async () => {
		const results = await testDmnDiff(
			"test/fixtures/add-row/before.dmn",
			"test/fixtures/add-row/after.dmn",
		);
		assert.containsAllKeys(results.added, ["DecisionRule_20pnqml"]);
		assert.containsAllKeys(results.removed, ["DecisionRule_10pnqml"]);
		assert.containsAllKeys(results.changed, ["Decision_1"]);
	});

	it("should discover change column types", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-columns-type/before.dmn",
			"test/fixtures/change-columns-type/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"Input_1",
			"InputExpression_1",
			"Output_1",
		]);
		expect(results.changed.Input_1.attrs).toEqual({
			inputVariable: { oldValue: undefined, newValue: "inputVar" },
		});
		expect(results.changed.InputExpression_1.attrs).toEqual({
			expressionLanguage: { oldValue: undefined, newValue: "javascript" },
			text: { oldValue: "", newValue: "console.log('test')" },
		});
		expect(results.changed.Output_1.attrs).toEqual({
			typeRef: { oldValue: "string", newValue: "boolean" },
		});
	});

	it("should discover change column types (reversed)", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-columns-type/after.dmn",
			"test/fixtures/change-columns-type/before.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"Input_1",
			"InputExpression_1",
			"Output_1",
		]);
		expect(results.changed.Input_1.attrs).toEqual({
			inputVariable: { oldValue: "inputVar", newValue: 0 },
		});
		expect(results.changed.InputExpression_1.attrs).toEqual({
			expressionLanguage: { oldValue: "javascript", newValue: 0 },
			text: { oldValue: "console.log('test')", newValue: "" },
		});
		expect(results.changed.Output_1.attrs).toEqual({
			typeRef: { oldValue: "boolean", newValue: "string" },
		});
	});

	it("should discover change column types", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-columns-type/before.dmn",
			"test/fixtures/change-columns-type/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"Input_1",
			"InputExpression_1",
			"Output_1",
		]);
	});

	it("should discover change row annotation", async () => {
		const results = await testDmnDiff(
			"test/fixtures/change-row-anno/before.dmn",
			"test/fixtures/change-row-anno/after.dmn",
		);
		expect(results.added).toEqual({});
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, [
			"Decision_1",
			"DecisionRule_10pnqml",
		]);
	});
});

describe("api", () => {
	it("should diff with default handler", async () => {
		const before = await importDmnDiagram(
			"test/fixtures/change-columns/before.dmn",
		);
		const after = await importDmnDiagram(
			"test/fixtures/change-columns/after.dmn",
		);
		const results = diff(before, after);
		assert.containsAllKeys(results.added, [
			"InputClause_0j51xwh",
			"LiteralExpression_0wnqqx2",
			"OutputClause_19qooh4",
			"UnaryTests_1v6m01o",
		]);
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, ["Decision_1"]);
	});

	it("should diff via static diff", async () => {
		const before = await importDmnDiagram(
			"test/fixtures/change-columns/before.dmn",
		);
		const after = await importDmnDiagram(
			"test/fixtures/change-columns/after.dmn",
		);
		const results = diff(before, after);
		assert.containsAllKeys(results.added, [
			"InputClause_0j51xwh",
			"LiteralExpression_0wnqqx2",
			"OutputClause_19qooh4",
			"UnaryTests_1v6m01o",
		]);
		expect(results.removed).toEqual({});
		assert.containsAllKeys(results.changed, ["Decision_1"]);
	});
});

// Helpers
async function importDmnDiagram(filePath: string) {
	const file = readFileSync(filePath, "utf-8");
	return new DmnModdle({ camunda: camundaScheme }).fromXML(file);
}

async function testDmnDiff(beforeFilePath: string, afterFilePath: string) {
	const before = await importDmnDiagram(beforeFilePath);
	const after = await importDmnDiagram(afterFilePath);
	const handler = new ChangeHandler();
	return diff(before, after, handler);
}
