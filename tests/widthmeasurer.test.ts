import { WidthMeasurer } from "../src";

describe("width creation with and without array", () => {
    const measure = new WidthMeasurer({
        defaultOutputPath: "./widths",
    });

    test("basic latin array creation", async () => {

        await measure.create(["Latin-1 Supplement", "Latin Extended-A"]);
        console.log(measure.measure("hello", measure.load("latin-1-supplement-10px-verdana.json")))
        console.log(measure.measure("Ā", measure.load("latin-extended-a-10px-verdana.json")))
         expect("lol").toBe("lol");
     });

    test("basic latin creation", async () => {
        await measure.create("Basic Latin");
        expect(measure.measure("hello", measure.load("basic-latin-10px-verdana.json"))).toBe("23.84");
    });
});
