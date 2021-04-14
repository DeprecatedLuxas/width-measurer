import { WidthMeasurer } from "../src";

describe("width creation with and without array", () => {
    const measure = new WidthMeasurer({
        defaultOutputPath: "./widths",
    });

    test("latin-1 latin extended array creation", async () => {

        await measure.create(["Latin-1 Supplement", "Latin Extended-A"]);
        expect(measure.measure("ö", measure.load("latin-1-supplement-10px-sans-serif.json"))).toBe("5.56");
        expect(measure.measure("Āā", measure.load("latin-extended-a-10px-sans-serif.json"))).toBe("12.23");
     });

    test("basic latin creation", async () => {
        await measure.create("Basic Latin");
        expect(measure.measure("hello", measure.load("basic-latin-10px-sans-serif.json"))).toBe("21.12");
    });

    test("basic latin creation with specific font", async () => {
        await measure.create("Basic Latin", {
            font: "10px Ubuntu Mono"
        });
    
        expect(measure.measure("hello", measure.load("basic-latin-10px-ubuntu-mono.json"))).toBe("20");
    });
});
