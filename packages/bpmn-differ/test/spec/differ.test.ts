import BpmnModdle from "bpmn-moddle";
import { expect, describe, it, assert } from "vitest";
import { readFileSync } from "node:fs";
import { ChangeHandler } from "../../src/change-handler";
import { diff, Differ } from "../../src";

describe("diffing", () => {
	describe("diff", () => {
		it.skip("should discover add", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/add/before.bpmn",
				"test/fixtures/add/after.bpmn",
			);
			assert.containsAllKeys(results._added, ["EndEvent_1", "SequenceFlow_2"]);
			expect(results._removed).toEqual({});
			expect(results._layoutChanged).toEqual({});
			expect(results._changed).toEqual({});
		});

		it.skip("should discover remove", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/remove/before.bpmn",
				"test/fixtures/remove/after.bpmn",
			);
			expect(results._added).toEqual({});
			assert.containsAllKeys(results._removed, ["Task_1", "SequenceFlow_1"]);
			expect(results._layoutChanged).toEqual({});
			expect(results._changed).toEqual({});
		});

		it.skip("should discover change", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/change/before.bpmn",
				"test/fixtures/change/after.bpmn",
			);
			expect(results._added).toEqual({});
			expect(results._removed).toEqual({});
			expect(results._layoutChanged).toEqual({});
			assert.containsAllKeys(results._changed, ["Task_1"]);
			expect(results._changed.Task_1.attrs).toEqual({
				name: { oldValue: undefined, newValue: "TASK" },
			});
		});

		it("should discover layout-change", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/layout-change/before.bpmn",
				"test/fixtures/layout-change/after.bpmn",
			);
			expect(results._added).toEqual({});
			expect(results._removed).toEqual({});
			assert.containsAllKeys(results._layoutChanged, [
				"Task_1",
				"SequenceFlow_1",
			]);
			expect(results._changed).toEqual({});
		});

		it("should discover timer-change", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/timer-change/before.bpmn",
				"test/fixtures/timer-change/after.bpmn",
			);
			expect(results._added).toEqual({});
			expect(results._removed).toEqual({});
			expect(results._layoutChanged).toEqual({});
			assert.containsAllKeys(results._changed, [
				"TimerEventDefinition_0fgktse",
			]);
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
			const results = new Differ().diff(before, after);
			expect(results._added).toEqual({});
			expect(results._removed).toEqual({});
			assert.containsAllKeys(results._layoutChanged, [
				"Task_1",
				"SequenceFlow_1",
			]);
			expect(results._changed).toEqual({});
		});

		it("should diff via static diff", async () => {
			const before = await importBPMNDiagram(
				"test/fixtures/layout-change/before.bpmn",
			);
			const after = await importBPMNDiagram(
				"test/fixtures/layout-change/after.bpmn",
			);
			const results = diff(before, after);
			expect(results._added).toEqual({});
			expect(results._removed).toEqual({});
			assert.containsAllKeys(results._layoutChanged, [
				"Task_1",
				"SequenceFlow_1",
			]);
			expect(results._changed).toEqual({});
		});
	});

	describe("should diff scenario", () => {
		it.skip("collaboration pools / lanes", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/collaboration/before.bpmn",
				"test/fixtures/collaboration/after.bpmn",
			);
			assert.containsAllKeys(results._added, ["Participant_2"]);
			assert.containsAllKeys(results._removed, [
				"Participant_1",
				"Lane_1",
				"Task_1",
			]);
			assert.containsAllKeys(results._layoutChanged, [
				"_Participant_2",
				"Lane_2",
			]);
			assert.containsAllKeys(results._changed, ["Lane_2"]);
		});

		it("lanes create", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/lanes/create-laneset-before.bpmn",
				"test/fixtures/lanes/create-laneset-after.bpmn",
			);
			expect(results._added).empty;
			expect(results._removed).empty;
			expect(results._layoutChanged).empty;
			assert.containsAllKeys(results._changed, ["Participant_03hz6qm"]);

			const changed = results._changed.Participant_03hz6qm;

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
			expect(results._added).empty;
			expect(results._removed).empty;
			expect(results._layoutChanged).empty;
			assert.containsAllKeys(results._changed, ["Participant_03hz6qm"]);
		});

		it("collaboration message flow", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/collaboration/message-flow-before.bpmn",
				"test/fixtures/collaboration/message-flow-after.bpmn",
			);

			expect(results._added).empty;
			assert.containsAllKeys(results._removed, [
				"Participant_1w6hx42",
				"MessageFlow_1ofxm38",
			]);

			expect(results._layoutChanged).empty;
			expect(results._changed).empty;
		});

		it.skip("extension elements", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/extension-elements/before.bpmn",
				"test/fixtures/extension-elements/after.bpmn",
			);
			expect(results._added).empty;
			expect(results._removed).empty;
			expect(results._layoutChanged).empty;
			assert.containsAllKeys(results._changed, ["usertask"]);
		});

		it("pizza collaboration StartEvent move", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/pizza-collaboration/start-event-old.bpmn",
				"test/fixtures/pizza-collaboration/start-event-new.bpmn",
			);
			expect(results._added).toEqual({});
			expect(results._removed).toEqual({});
			assert.containsAllKeys(results._layoutChanged, ["_6-61"]);
			expect(results._changed).toEqual({});
		});

		it.skip("pizza collaboration", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/pizza-collaboration/old.bpmn",
				"test/fixtures/pizza-collaboration/new.bpmn",
			);
			assert.containsAllKeys(results._added, [
				"ManualTask_1",
				"ExclusiveGateway_1",
				"undefined",
			]);
			assert.containsAllKeys(results._removed, [
				"_6-674",
				"_6-691",
				"_6-746",
				"_6-748",
				"_6-74",
				"_6-125",
				"_6-178",
				"_6-642",
				"undefined",
			]);
			assert.containsAllKeys(results._layoutChanged, ["_6-61"]);
			assert.containsAllKeys(results._changed, ["_6-127"]);
		});

		it.skip("data-objects", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/data-objects/before.bpmn",
				"test/fixtures/data-objects/after.bpmn",
			);
			assert.containsAllKeys(results._added, [
				"DataObjectReference_E",
				"DataOutputAssociation_2",
				"DataOutputAssociation_3",
				"DataStoreReference_D",
			]);
			assert.containsAllKeys(results._removed, [
				"DataInputAssociation_4",
				"DataOutputAssociation_5",
				"DataStoreReference_C",
			]);
			assert.containsAllKeys(results._layoutChanged, [
				// waypoints changed
				"DataInputAssociation_1",
			]);
			assert.containsAllKeys(results._changed, ["Process_1"]);
		});

		it.skip("event definition", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/event-definition/before.bpmn",
				"test/fixtures/event-definition/after.bpmn",
			);
			expect(results._added).empty;
			expect(results._removed).empty;
			expect(results._layoutChanged).empty;
			assert.containsAllKeys(results._changed, [
				"IntermediateThrowEvent_0mn39ym",
			]);
			const changed = results._changed.IntermediateThrowEvent_0mn39ym;
			assert.containsAllKeys(changed.attrs, ["eventDefinitions[0]"]);
		});

		it.skip("sub-processes", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/sub-processes/before.bpmn",
				"test/fixtures/sub-processes/after.bpmn",
			);
			assert.containsAllKeys(results._added, ["Task_F", "SubProcess_4"]);
			assert.containsAllKeys(results._removed, [
				"Task_A",
				"Task_B",
				"SubProcess_3",
			]);
			assert.containsAllKeys(results._layoutChanged, [
				// sub-process collapsed state changed
				"SubProcess_5",
			]);
			expect(results._changed).empty;
		});

		it("signavio-collapsed", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/signavio-collapsed/before.collapsed.bpmn",
				"test/fixtures/signavio-collapsed/after.expanded.bpmn",
			);
			expect(results._added).empty;
			expect(results._removed).empty;
			assert.containsAllKeys(results._layoutChanged, [
				// sub-process collapsed state changed
				"SubProcess_1",
			]);
			expect(results._changed).empty;
		});

		it("different collaborations", async () => {
			const results = await testBPMNDiff(
				"test/fixtures/different-collaboration/before.bpmn",
				"test/fixtures/different-collaboration/after.bpmn",
			);
			assert.containsAllKeys(results._added, [
				"Collaboration_108r8n7",
				"Participant_1sdnyht",
			]);
			assert.containsAllKeys(results._removed, [
				"Collaboration_1cidyxu",
				"Participant_0px403d",
			]);
			expect(results._layoutChanged).empty;
			expect(results._changed).empty;
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
	const handler = new ChangeHandler();
	return new Differ().diff(before, after, handler);
}
