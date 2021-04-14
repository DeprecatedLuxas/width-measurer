import { WidthMeasurerOptions, BlockOptions, WidthBlockObject } from "./types";
import PuppeteerBuilder from "./puppeteerBuilder";
import {
    getUnicodeBlocks,
    saveWidthBlockToFile,
    getWidthTable,
    binarySearch,
    isAControlChar
} from "./utils";


import defaultBasicLatin from "./defaultBasicLatin";

export class WidthMeasurer {
    private readonly options: WidthMeasurerOptions;

    constructor(options: WidthMeasurerOptions = {}) {
        options.defaultOutputPath = options.defaultOutputPath || "./";
        this.options = options;
    }

    public async create(
        unicodeBlock: string | string[],
        options: BlockOptions = {}
    ): Promise<void> {
        try {
            const puppeteer = new PuppeteerBuilder(
                options.font ?? "10px sans-serif"
            );
            await puppeteer.initPuppeteer();
            if (Array.isArray(unicodeBlock)) {
                for (const block of unicodeBlock) {
                    const unicodeBlockSearch = getUnicodeBlocks(block);
                    const widths = await puppeteer.widthOfRange(
                        block,
                        parseInt(unicodeBlockSearch[0].start, 16),
                        parseInt(unicodeBlockSearch[0].end, 16)
                    );
                    saveWidthBlockToFile(
                        this.options.defaultOutputPath ?? "./",
                        unicodeBlockSearch[0].name,
                        widths
                    );
                }
            } else {
                const unicodeBlockSearch = getUnicodeBlocks(unicodeBlock);
                const widths = await puppeteer.widthOfRange(
                    unicodeBlock,
                    parseInt(unicodeBlockSearch[0].start, 16),
                    parseInt(unicodeBlockSearch[0].end, 16)
                );
                saveWidthBlockToFile(
                    this.options.defaultOutputPath ?? "./",
                    unicodeBlockSearch[0].name,
                    widths
                );
            }
            await puppeteer.destroyPuppeteer();
        } catch (error) {
            console.error(error);
        }
    }
    
    public load(path: string): WidthBlockObject | undefined {
        return getWidthTable(this.options.defaultOutputPath ?? "./", path);
    }

    public measure(text: string, widthTable: WidthBlockObject | undefined): string {
        widthTable = widthTable ?? defaultBasicLatin as WidthBlockObject;
        
        return Array.from(text).reduce((acummWidth: string, char: string): string => {    
            const charCode: number | undefined = char.codePointAt(0) ?? 32; // If char is undefined it defaults to whitespace in the basic latin.
            if (widthTable === undefined) throw new Error("widthTable is somehow undefined, please report this.");
            widthTable.name = widthTable?.name ?? defaultBasicLatin.name;
            let characterWidth: number;
            if (isAControlChar(widthTable?.name, charCode)) {
                characterWidth = 0.0;
            } else {
                characterWidth = widthTable?.widths[binarySearch(widthTable.widths, charCode)].width;
            }
            return (parseFloat(acummWidth) + characterWidth).toString();
        }, "0.00");
    }
}
