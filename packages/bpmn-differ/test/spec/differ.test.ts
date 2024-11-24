import BpmnModdle from "bpmn-moddle";
import { expect, describe, it, assert } from "vitest";
import { readFileSync } from "node:fs";
import { diff } from "../../src";

describe("diffing", () => {
	describe("diff", () => {
		it("should discover add", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/add/before.bpmn",
				"test/fixtures/add/after.bpmn",
			);
			assert.containsAllKeys(results.added, ["EndEvent_1", "SequenceFlow_2"]);
			expect(results.removed).toEqual({});
			expect(results.layoutChanged).toEqual({});
		});

		it("should discover remove", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/remove/before.bpmn",
				"test/fixtures/remove/after.bpmn",
			);
			expect(results.added).toEqual({});
			assert.containsAllKeys(results.removed, ["Task_1", "SequenceFlow_1"]);
			expect(results.layoutChanged).toEqual({});
			expect(results.changed).toEqual({});
		});

		it("should discover change", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/change/before.bpmn",
				"test/fixtures/change/after.bpmn",
			);
			expect(results.added).toEqual({});
			expect(results.removed).toEqual({});
			expect(results.layoutChanged).toEqual({});
			assert.containsAllKeys(results.changed, ["Task_1"]);
			expect(results.changed.Task_1.attrs).toEqual({
				name: { oldValue: undefined, newValue: "TASK" },
			});
		});

		it("should discover layout-change", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/layout-change/before.bpmn",
				"test/fixtures/layout-change/after.bpmn",
			);
			expect(results.added).toEqual({});
			expect(results.removed).toEqual({});
			assert.containsAllKeys(results.layoutChanged, [
				"Task_1",
				"SequenceFlow_1",
			]);
			expect(results.changed).toEqual({});
		});
	});

	describe("api", () => {
		it("should diff with default handler", async () => {
			const before = await importBPMNDiagram(
				"test/fixtures/layout-change/before.bpmn",
			);
			const after = await importBPMNDiagram(
				"test/fixtures/layout-change/after.bpmn",
			);
			const results = diff(before, after);
			expect(results.added).toEqual({});
			expect(results.removed).toEqual({});
			assert.containsAllKeys(results.layoutChanged, [
				"Task_1",
				"SequenceFlow_1",
			]);
			expect(results.changed).toEqual({});
		});

		it("should diff via static diff", async () => {
			const before = await importBPMNDiagram(
				"test/fixtures/layout-change/before.bpmn",
			);
			const after = await importBPMNDiagram(
				"test/fixtures/layout-change/after.bpmn",
			);
			const results = diff(before, after);
			expect(results.added).toEqual({});
			expect(results.removed).toEqual({});
			assert.containsAllKeys(results.layoutChanged, [
				"Task_1",
				"SequenceFlow_1",
			]);
			expect(results.changed).toEqual({});
		});
	});

	describe("should diff scenario", () => {
		it("collaboration pools / lanes", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/collaboration/before.bpmn",
				"test/fixtures/collaboration/after.bpmn",
			);
			assert.containsAllKeys(results.added, ["Participant_2"]);
			assert.containsAllKeys(results.removed, [
				"Participant_1",
				"Lane_1",
				"Task_1",
			]);
			assert.containsAllKeys(results.layoutChanged, [
				"_Participant_2",
				"Lane_2",
			]);
			assert.containsAllKeys(results.changed, ["Lane_2"]);
		});

		it("lanes create", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/lanes/create-laneset-before.bpmn",
				"test/fixtures/lanes/create-laneset-after.bpmn",
			);
			expect(results.added).empty;
			expect(results.removed).empty;
			expect(results.layoutChanged).empty;
			assert.containsAllKeys(results.changed, ["Participant_03hz6qm"]);

			const changed = results.changed.Participant_03hz6qm;
			assert.containsAllKeys(changed.attrs, ["processRef.laneSets[0]"]);

			const changedLaneSets = changed.attrs["processRef.laneSets[0]"];

			expect(changedLaneSets.oldValue).not.to.exist;
			expect(changedLaneSets.newValue).to.exist;
		});

		it("lanes remove", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/lanes/create-laneset-after.bpmn",
				"test/fixtures/lanes/create-laneset-before.bpmn",
			);
			expect(results.added).empty;
			expect(results.removed).empty;
			expect(results.layoutChanged).empty;
			assert.containsAllKeys(results.changed, ["Participant_03hz6qm"]);
		});

		it("collaboration message flow", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/collaboration/message-flow-before.bpmn",
				"test/fixtures/collaboration/message-flow-after.bpmn",
			);

			expect(results.added).empty;
			assert.containsAllKeys(results.removed, [
				"Participant_1w6hx42",
				"MessageFlow_1ofxm38",
			]);

			expect(results.layoutChanged).empty;
			expect(results.changed).empty;
		});

		it("extension elements", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/extension-elements/before.bpmn",
				"test/fixtures/extension-elements/after.bpmn",
			);
			expect(results.added).empty;
			expect(results.removed).empty;
			expect(results.layoutChanged).empty;
			assert.containsAllKeys(results.changed, ["usertask"]);
		});

		it("pizza collaboration StartEvent move", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/pizza-collaboration/start-event-old.bpmn",
				"test/fixtures/pizza-collaboration/start-event-new.bpmn",
			);
			expect(results.added).toEqual({});
			expect(results.removed).toEqual({});
			assert.containsAllKeys(results.layoutChanged, ["_6-61"]);
			expect(results.changed).toEqual({});
		});

		it("pizza collaboration", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/pizza-collaboration/old.bpmn",
				"test/fixtures/pizza-collaboration/new.bpmn",
			);
			assert.containsAllKeys(results.added, [
				"ManualTask_1",
				"ExclusiveGateway_1",
			]);
			assert.containsAllKeys(results.removed, [
				"_6-674",
				"_6-691",
				"_6-746",
				"_6-748",
				"_6-74",
				"_6-125",
				"_6-178",
				"_6-642",
			]);
			assert.containsAllKeys(results.layoutChanged, ["_6-61"]);
			assert.containsAllKeys(results.changed, ["_6-127"]);
		});

		it("data-objects", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/data-objects/before.bpmn",
				"test/fixtures/data-objects/after.bpmn",
			);
			assert.containsAllKeys(results.added, [
				"DataObjectReference_E",
				"DataOutputAssociation_2",
				"DataOutputAssociation_3",
				"DataStoreReference_D",
			]);
			assert.containsAllKeys(results.removed, [
				"DataInputAssociation_4",
				"DataOutputAssociation_5",
				"DataStoreReference_C",
			]);
			assert.containsAllKeys(results.layoutChanged, [
				// waypoints changed
				"DataInputAssociation_1",
			]);
			assert.containsAllKeys(results.changed, ["Process_1"]);
		});

		it("event definition", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/event-definition/before.bpmn",
				"test/fixtures/event-definition/after.bpmn",
			);
			expect(results.added).empty;
			expect(results.removed).empty;
			expect(results.layoutChanged).empty;
			assert.containsAllKeys(results.changed, [
				"IntermediateThrowEvent_0mn39ym",
			]);
			const changed = results.changed.IntermediateThrowEvent_0mn39ym;
			assert.containsAllKeys(changed.attrs, ["eventDefinitions[0]"]);
		});

		it("sub-processes", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/sub-processes/before.bpmn",
				"test/fixtures/sub-processes/after.bpmn",
			);
			assert.containsAllKeys(results.added, ["Task_F", "SubProcess_4"]);
			assert.containsAllKeys(results.removed, [
				"Task_A",
				"Task_B",
				"SubProcess_3",
			]);
			assert.containsAllKeys(results.layoutChanged, [
				// sub-process collapsed state changed
				"SubProcess_5",
			]);
			expect(results.changed).empty;
		});

		it("signavio-collapsed", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/signavio-collapsed/before.collapsed.bpmn",
				"test/fixtures/signavio-collapsed/after.expanded.bpmn",
			);
			expect(results.added).empty;
			expect(results.removed).empty;
			assert.containsAllKeys(results.layoutChanged, [
				// sub-process collapsed state changed
				"SubProcess_1",
			]);
			expect(results.changed).empty;
		});

		it("different collaborations", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/different-collaboration/before.bpmn",
				"test/fixtures/different-collaboration/after.bpmn",
			);
			assert.containsAllKeys(results.added, [
				"Collaboration_108r8n7",
				"Participant_1sdnyht",
			]);
			assert.containsAllKeys(results.removed, [
				"Collaboration_1cidyxu",
				"Participant_0px403d",
			]);
			expect(results.layoutChanged).empty;
			expect(results.changed).empty;
		});
	});
});

// Helpers
async function importBPMNDiagram(filePath: string) {
	const file = readFileSync(filePath, "utf-8");
	return new BpmnModdle().fromXML(file);
}

async function testBPMNDiff(beforeFilePath: string, afterFilePath: string) {
	const before = await importBPMNDiagram(beforeFilePath);
	const after = await importBPMNDiagram(afterFilePath);
	return diff(before, after);
}
