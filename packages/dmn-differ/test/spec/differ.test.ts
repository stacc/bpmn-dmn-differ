import { expect, describe, it } from "bun:test";
import DmnModdle from "dmn-moddle";
import { Differ, diff, camundaScheme } from "../../src";
import { ChangeHandler } from "../../src/change-handler";

describe("diffing", () => {
  it("should discover table add", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/add-table/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/add-table/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toContainAllKeys(["Decision_2"]);
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toEqual({});

      done();
    });
  });

  it("should discover table field change", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/change-table/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/change-table/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "LiteralExpression_11bnf50",
        "UnaryTests_16zmfgt",
      ]);

      expect(results._changed.LiteralExpression_11bnf50.attrs).toEqual({
        text: { oldValue: "ausgabe2", newValue: "ausgabe2-change" },
      });

      expect(results._changed.UnaryTests_16zmfgt.attrs).toEqual({
        text: { oldValue: "eingabe1", newValue: "eingabe1-change" },
      });

      done();
    });
  });

  it("should discover table drop", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/drop-table/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/drop-table/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toContainAllKeys(["Decision_2"]);
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toEqual({});

      done();
    });
  });

  it("should discover change hit policy", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/change-policy/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/change-policy/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "DecisionTable_0zjc24h",
      ]);

      expect(results._changed.DecisionTable_0zjc24h.attrs).toEqual({
        hitPolicy: { oldValue: "FIRST", newValue: "COLLECT" },
      });

      done();
    });
  });

  it("should discover change hit policy unique", (done) => {
    const aDiagram = Bun.file(
      "test/fixtures/dmn/change-policy-unique/before.dmn"
    );
    const bDiagram = Bun.file(
      "test/fixtures/dmn/change-policy-unique/after.dmn"
    );

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys(["DecisionTable_0zjc24h"]);

      expect(results._changed.DecisionTable_0zjc24h.attrs).toEqual({
        hitPolicy: { oldValue: "UNIQUE", newValue: "FIRST" },
      });

      done();
    });
  });

  it("should discover change hit policy unique (reversed)", (done) => {
    const aDiagramRev = Bun.file(
      "test/fixtures/dmn/change-policy-unique/before.dmn"
    );
    const bDiagramRev = Bun.file(
      "test/fixtures/dmn/change-policy-unique/after.dmn"
    );

    // when
    testDmnDiff(bDiagramRev, aDiagramRev, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "DecisionTable_0zjc24h",
      ]);

      expect(
        // biome-ignore lint/style/noCommaOperator: <explanation>
        results._changed[("Decision_1", "DecisionTable_0zjc24h")].attrs
      ).toEqual({
        hitPolicy: { oldValue: "FIRST", newValue: "UNIQUE" },
      });

      done();
    });
  });

  it("should discover change hit policy aggregation", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/change-policy-agg/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/change-policy-agg/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "DecisionTable_0zjc24h",
      ]);

      expect(results._changed.DecisionTable_0zjc24h.attrs).toEqual({
        aggregation: { oldValue: undefined, newValue: "SUM" },
        hitPolicy: { oldValue: "PRIORITY", newValue: "COLLECT" },
      });

      done();
    });
  });

  it("should discover change hit policy aggregation (reverse)", (done) => {
    const aDiagramRev = Bun.file(
      "test/fixtures/dmn/change-policy-agg/before.dmn"
    );
    const bDiagramRev = Bun.file(
      "test/fixtures/dmn/change-policy-agg/after.dmn"
    );

    // when
    testDmnDiff(bDiagramRev, aDiagramRev, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "DecisionTable_0zjc24h",
      ]);

      expect(results._changed.DecisionTable_0zjc24h.attrs).toEqual({
        aggregation: { oldValue: "SUM", newValue: 0 },
        hitPolicy: { oldValue: "COLLECT", newValue: "PRIORITY" },
      });

      done();
    });
  });

  it("should discover change input constiable", (done) => {
    const aDiagram = Bun.file(
      "test/fixtures/dmn/change-input-const/before.dmn"
    );
    const bDiagram = Bun.file("test/fixtures/dmn/change-input-const/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys(["Decision_1", "Input_1"]);

      expect(results._changed.Input_1.attrs).toEqual({
        inputconstiable: { oldValue: undefined, newValue: "inputconst" },
      });

      done();
    });
  });

  it("should discover change columns", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/change-columns/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/change-columns/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toContainAllKeys([
        "InputClause_0j51xwh",
        "LiteralExpression_0wnqqx2",
        "OutputClause_19qooh4",
        "UnaryTests_1v6m01o",
      ]);
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys(["Decision_1"]);

      done();
    });
  });

  it("should discover add and remove row", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/add-row/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/add-row/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toContainAllKeys(["DecisionRule_20pnqml"]);
      expect(results._removed).toContainAllKeys(["DecisionRule_10pnqml"]);
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys(["Decision_1"]);

      done();
    });
  });

  it("should discover change column types", (done) => {
    const aDiagram = Bun.file(
      "test/fixtures/dmn/change-columns-type/before.dmn"
    );
    const bDiagram = Bun.file(
      "test/fixtures/dmn/change-columns-type/after.dmn"
    );

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "Input_1",
        "InputExpression_1",
        "Output_1",
      ]);

      expect(results._changed.Input_1.attrs).toEqual({
        inputconstiable: { oldValue: undefined, newValue: "inputconst" },
      });

      expect(results._changed.InputExpression_1.attrs).toEqual({
        expressionLanguage: { oldValue: undefined, newValue: "javascript" },
        text: { oldValue: "", newValue: "console.log('test')" },
      });

      expect(results._changed.Output_1.attrs).toEqual({
        typeRef: { oldValue: "string", newValue: "boolean" },
      });

      done();
    });
  });

  it("should discover change column types (reversed)", (done) => {
    const aDiagramRev = Bun.file(
      "test/fixtures/dmn/change-columns-type/before.dmn"
    );
    const bDiagramRev = Bun.file(
      "test/fixtures/dmn/change-columns-type/after.dmn"
    );

    // when
    testDmnDiff(bDiagramRev, aDiagramRev, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "Input_1",
        "InputExpression_1",
        "Output_1",
      ]);

      expect(results._changed.Input_1.attrs).toEqual({
        inputconstiable: { oldValue: "inputconst", newValue: 0 },
      });

      expect(results._changed.InputExpression_1.attrs).toEqual({
        expressionLanguage: { oldValue: "javascript", newValue: 0 },
        text: { oldValue: "console.log('test')", newValue: "" },
      });

      expect(results._changed.Output_1.attrs).toEqual({
        typeRef: { oldValue: "boolean", newValue: "string" },
      });

      done();
    });
  });

  it("should discover change column types", (done) => {
    const aDiagram = Bun.file(
      "test/fixtures/dmn/change-columns-type/before.dmn"
    );
    const bDiagram = Bun.file(
      "test/fixtures/dmn/change-columns-type/after.dmn"
    );

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "Input_1",
        "InputExpression_1",
        "Output_1",
      ]);

      done();
    });
  });

  it("should discover change row annotation", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/change-row-anno/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/change-row-anno/after.dmn");

    // when
    testDmnDiff(aDiagram, bDiagram, (err, results) => {
      if (err) {
        return done(err);
      }

      // then
      expect(results._added).toEqual({});
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys([
        "Decision_1",
        "DecisionRule_10pnqml",
      ]);

      done();
    });
  });
});

describe("api", () => {
  it("should diff with default handler", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/change-columns/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/change-columns/after.dmn");

    // when
    importDmnDiagrams(aDiagram, bDiagram, (err) => {
      if (err) {
        return done(err);
      }

      // when
      const results = new Differ().diff();

      // then
      expect(results._added).toContainAllKeys([
        "InputClause_0j51xwh",
        "LiteralExpression_0wnqqx2",
        "OutputClause_19qooh4",
        "UnaryTests_1v6m01o",
      ]);
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys(["Decision_1"]);

      done();
    });
  });

  it("should diff via static diff", (done) => {
    const aDiagram = Bun.file("test/fixtures/dmn/change-columns/before.dmn");
    const bDiagram = Bun.file("test/fixtures/dmn/change-columns/after.dmn");

    // when
    importDmnDiagrams(aDiagram, bDiagram, (err) => {
      if (err) {
        return done(err);
      }

      // when
      const results = diff();

      // then
      expect(results._added).toContainAllKeys([
        "InputClause_0j51xwh",
        "LiteralExpression_0wnqqx2",
        "OutputClause_19qooh4",
        "UnaryTests_1v6m01o",
      ]);
      expect(results._removed).toEqual({});
      expect(results._layoutChanged).toEqual({});
      expect(results._changed).toContainAllKeys(["Decision_1"]);

      done();
    });
  });
});

// helpers //////////////////
function importDmnDiagrams(a, b, done) {
  new DmnModdle({ camunda: camundaScheme }).fromXML(a, (err, adefs) => {
    if (err) {
      return done(err);
    }

    new DmnModdle({ camunda: camundaScheme }).fromXML(b, (err, bdefs) => {
      if (err) {
        return done(err);
      }
      return done(null, adefs, bdefs);
    });
  });
}

function testDmnDiff(a, b, done) {
  importDmnDiagrams(a, b, (err, adefs, bdefs) => {
    if (err) {
      return done(err);
    }

    // given
    const handler = new ChangeHandler();

    // when
    new Differ().diff(adefs, bdefs, handler);

    done(err, handler, adefs, bdefs);
  });
}
