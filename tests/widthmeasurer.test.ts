import { WidthMeasurer } from "../src";

describe("width creation with and without array", () => {
    const measure = new WidthMeasurer({
        defaultOutputPath: "./widths",
    });

    test("latin-1 latin extended array creation", async () => {

        await measure.create(["Latin-1 Supplement", "Latin Extended-A"]);
        expect(measure.measure("ö", measure.load("latin-1-supplement-10px-verdana.json"))).toBe("6.07");
        expect(measure.measure("Āā", measure.load("latin-extended-a-10px-verdana.json"))).toBe("12.85");
     });

    test("basic latin creation", async () => {
        await measure.create("Basic Latin");
        expect(measure.measure("hello", measure.load("basic-latin-10px-verdana.json"))).toBe("23.84");
    });
});
