// import BpmnModdle from "bpmn-moddle";
// import { Differ, diff } from "../../src";
// import { ChangeHandler } from "../../src/change-handler";
// import { expect, describe, it } from "bun:test";

// describe("diffing", () => {
//   describe("diff", () => {
//     it("should discover add", (done) => {
//       const aDiagram = Bun.file("test/fixtures/add/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/add/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toContainAllKeys([
//           "EndEvent_1",
//           "SequenceFlow_2",
//         ]);
//         expect(results._removed).toEqual({});
//         expect(results._layoutChanged).toEqual({});
//         expect(results._changed).toEqual({});

//         done();
//       });
//     });

//     it("should discover remove", (done) => {
//       const aDiagram = Bun.file("test/fixtures/remove/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/remove/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toEqual({});
//         expect(results._removed).toContainAllKeys(["Task_1", "SequenceFlow_1"]);
//         expect(results._layoutChanged).toEqual({});
//         expect(results._changed).toEqual({});

//         done();
//       });
//     });

//     it("should discover change", (done) => {
//       const aDiagram = Bun.file("test/fixtures/change/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/change/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toEqual({});
//         expect(results._removed).toEqual({});
//         expect(results._layoutChanged).toEqual({});
//         expect(results._changed).toContainAllKeys(["Task_1"]);

//         expect(results._changed.Task_1.attrs).toEqual({
//           name: { oldValue: undefined, newValue: "TASK" },
//         });

//         done();
//       });
//     });

//     it("should discover layout-change", (done) => {
//       const aDiagram = Bun.file("test/fixtures/layout-change/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/layout-change/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toEqual({});
//         expect(results._removed).toEqual({});
//         expect(results._layoutChanged).toContainAllKeys([
//           "Task_1",
//           "SequenceFlow_1",
//         ]);
//         expect(results._changed).toEqual({});

//         done();
//       });
//     });

//     it("should discover timer-change", (done) => {
//       const aDiagram = Bun.file("test/fixtures/timer-change/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/timer-change/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toEqual({});
//         expect(results._removed).toEqual({});
//         expect(results._layoutChanged).toEqual({});
//         expect(results._changed).toContainAllKeys([
//           "TimerEventDefinition_0fgktse",
//         ]);

//         done();
//       });
//     });
//   });

//   describe("api", () => {
//     it("should diff with default handler", (done) => {
//       const aDiagram = Bun.file("test/fixtures/layout-change/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/layout-change/after.bpmn");

//       // when
//       importDiagrams(aDiagram, bDiagram, (err) => {
//         if (err) {
//           return done(err);
//         }

//         // when
//         const results = new Differ().diff(aDiagram, bDiagram);

//         // then
//         expect(results._added).toEqual({});
//         expect(results._removed).toEqual({});
//         expect(results._layoutChanged).toContainAllKeys([
//           "Task_1",
//           "SequenceFlow_1",
//         ]);
//         expect(results._changed).toEqual({});

//         done();
//       });
//     });

//     it("should diff via static diff", (done) => {
//       const aDiagram = Bun.file("test/fixtures/layout-change/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/layout-change/after.bpmn");

//       // when
//       importDiagrams(aDiagram, bDiagram, (err) => {
//         if (err) {
//           return done(err);
//         }

//         // when
//         const results = diff(aDiagram, bDiagram);

//         // then
//         expect(results._added).toEqual({});
//         expect(results._removed).toEqual({});
//         expect(results._layoutChanged).toContainAllKeys([
//           "Task_1",
//           "SequenceFlow_1",
//         ]);
//         expect(results._changed).toEqual({});

//         done();
//       });
//     });
//   });

//   describe("should diff scenario", () => {
//     it("collaboration pools / lanes", (done) => {
//       const aDiagram = Bun.file("test/fixtures/collaboration/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/collaboration/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toContainAllKeys(["Participant_2"]);
//         expect(results._removed).toContainAllKeys([
//           "Participant_1",
//           "Lane_1",
//           "Task_1",
//         ]);
//         expect(results._layoutChanged).toContainAllKeys([
//           "_Participant_2",
//           "Lane_2",
//         ]);
//         expect(results._changed).toContainAllKeys(["Lane_2"]);

//         done();
//       });
//     });

//     it("lanes create", (done) => {
//       const aDiagram = Bun.file(
//         "test/fixtures/lanes/create-laneset-before.bpmn"
//       );
//       const bDiagram = Bun.file(
//         "test/fixtures/lanes/create-laneset-after.bpmn"
//       );

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toBeEmpty;
//         expect(results._removed).toBeEmpty;
//         expect(results._layoutChanged).toBeEmpty;
//         expect(results._changed).toContainAllKeys(["Participant_03hz6qm"]);

//         const changed = results._changed.Participant_03hz6qm;

//         expect(changed.attrs).toContainAllKeys(["processRef.laneSets[0]"]);

//         const changedLaneSets = changed.attrs["processRef.laneSets[0]"];

//         expect(changedLaneSets.oldValue).not.to.exist;
//         expect(changedLaneSets.newValue).to.exist;

//         done();
//       });
//     });

//     it("lanes remove", (done) => {
//       const aDiagram = Bun.file(
//         "test/fixtures/lanes/create-laneset-after.bpmn"
//       );
//       const bDiagram = Bun.file(
//         "test/fixtures/lanes/create-laneset-before.bpmn"
//       );

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toBeEmpty;
//         expect(results._removed).toBeEmpty;
//         expect(results._layoutChanged).toBeEmpty;
//         expect(results._changed).toContainAllKeys(["Participant_03hz6qm"]);

//         done();
//       });
//     });

//     it("collaboration message flow", (done) => {
//       const aDiagram = Bun.file(
//         "test/fixtures/collaboration/message-flow-before.bpmn"
//       );
//       const bDiagram = Bun.file(
//         "test/fixtures/collaboration/message-flow-after.bpmn"
//       );

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toBeEmpty;
//         expect(results._removed).toContainAllKeys([
//           "Participant_1w6hx42",
//           "MessageFlow_1ofxm38",
//         ]);
//         expect(results._layoutChanged).toBeEmpty;
//         expect(results._changed).toBeEmpty;

//         done();
//       });
//     });

//     it("extension elements", (done) => {
//       const aDiagram = Bun.file("test/fixtures/extension-elements/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/extension-elements/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toBeEmpty;
//         expect(results._removed).toBeEmpty;
//         expect(results._layoutChanged).toBeEmpty;
//         expect(results._changed).toContainAllKeys(["usertask"]);

//         done();
//       });
//     });

//     it("pizza collaboration StartEvent move", (done) => {
//       const aDiagram = Bun.file(
//         "test/fixtures/pizza-collaboration/start-event-old.bpmn"
//       );
//       const bDiagram = Bun.file(
//         "test/fixtures/pizza-collaboration/start-event-new.bpmn"
//       );

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toEqual({});
//         expect(results._removed).toEqual({});
//         expect(results._layoutChanged).toContainAllKeys(["_6-61"]);
//         expect(results._changed).toEqual({});

//         done();
//       });
//     });

//     it("pizza collaboration", (done) => {
//       const aDiagram = Bun.file("test/fixtures/pizza-collaboration/old.bpmn");
//       const bDiagram = Bun.file("test/fixtures/pizza-collaboration/new.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toContainAllKeys([
//           "ManualTask_1",
//           "ExclusiveGateway_1",
//           "undefined",
//         ]);

//         expect(results._removed).toContainAllKeys([
//           "_6-674",
//           "_6-691",
//           "_6-746",
//           "_6-748",
//           "_6-74",
//           "_6-125",
//           "_6-178",
//           "_6-642",
//           "undefined",
//         ]);

//         expect(results._layoutChanged).toContainAllKeys(["_6-61"]);

//         expect(results._changed).toContainAllKeys(["_6-127"]);

//         done();
//       });
//     });

//     it("data-objects", (done) => {
//       const aDiagram = Bun.file("test/fixtures/data-objects/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/data-objects/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toContainAllKeys([
//           "DataObjectReference_E",
//           "DataOutputAssociation_2",
//           "DataOutputAssociation_3",
//           "DataStoreReference_D",
//         ]);

//         expect(results._removed).toContainAllKeys([
//           "DataInputAssociation_4",
//           "DataOutputAssociation_5",
//           "DataStoreReference_C",
//         ]);

//         expect(results._layoutChanged).toContainAllKeys([
//           // waypoints changed
//           "DataInputAssociation_1",
//         ]);

//         // TODO(nikku): detect bpmn:DataObjectReference#dataObject change
//         expect(results._changed).toContainAllKeys(["Process_1"]);

//         done();
//       });
//     });

//     it("event definition", (done) => {
//       const aDiagram = Bun.file("test/fixtures/event-definition/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/event-definition/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toBeEmpty;

//         expect(results._removed).toBeEmpty;

//         expect(results._layoutChanged).toBeEmpty;

//         expect(results._changed).toContainAllKeys([
//           "IntermediateThrowEvent_0mn39ym",
//         ]);

//         const changed = results._changed.IntermediateThrowEvent_0mn39ym;

//         expect(changed.attrs).toContainAllKeys(["eventDefinitions[0]"]);

//         done();
//       });
//     });

//     it("sub-processes", (done) => {
//       const aDiagram = Bun.file("test/fixtures/sub-processes/before.bpmn");
//       const bDiagram = Bun.file("test/fixtures/sub-processes/after.bpmn");

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toContainAllKeys(["Task_F", "SubProcess_4"]);

//         expect(results._removed).toContainAllKeys([
//           "Task_A",
//           "Task_B",
//           "SubProcess_3",
//         ]);

//         expect(results._layoutChanged).toContainAllKeys([
//           // sub-process collapsed state changed
//           "SubProcess_5",
//         ]);

//         expect(results._changed).toBeEmpty;

//         done();
//       });
//     });

//     it("signavio-collapsed", (done) => {
//       const aDiagram = Bun.file(
//         "test/fixtures/signavio-collapsed/before.collapsed.bpmn"
//       );
//       const bDiagram = Bun.file(
//         "test/fixtures/signavio-collapsed/after.expanded.bpmn"
//       );

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toBeEmpty;

//         expect(results._removed).toBeEmpty;

//         expect(results._layoutChanged).toContainAllKeys([
//           // sub-process collapsed state changed
//           "SubProcess_1",
//         ]);

//         expect(results._changed).toBeEmpty;

//         done();
//       });
//     });

//     it("different collaborations", (done) => {
//       const aDiagram = Bun.file(
//         "test/fixtures/different-collaboration/before.bpmn"
//       );
//       const bDiagram = Bun.file(
//         "test/fixtures/different-collaboration/after.bpmn"
//       );

//       // when
//       testDiff(aDiagram, bDiagram, (err, results) => {
//         if (err) {
//           return done(err);
//         }

//         // then
//         expect(results._added).toContainAllKeys([
//           "Collaboration_108r8n7",
//           "Participant_1sdnyht",
//         ]);

//         expect(results._removed).toContainAllKeys([
//           "Collaboration_1cidyxu",
//           "Participant_0px403d",
//         ]);

//         expect(results._layoutChanged).toBeEmpty;

//         expect(results._changed).toBeEmpty;

//         done();
//       });
//     });
//   });
// });

// // helpers //////////////////

// function importDiagrams(a, b, done) {
//   new BpmnModdle().fromXML(a, (err, adefs) => {
//     if (err) {
//       return done(err);
//     }

//     new BpmnModdle().fromXML(b, (err, bdefs) => {
//       if (err) {
//         return done(err);
//       }
//       return done(null, adefs, bdefs);
//     });
//   });
// }

// function testDiff(a, b, done) {
//   importDiagrams(a, b, (err, adefs, bdefs) => {
//     if (err) {
//       return done(err);
//     }

//     // given
//     const handler = new ChangeHandler();

//     // when
//     new Differ().diff(adefs, bdefs, handler);

//     done(err, handler, adefs, bdefs);
//   });
// }
