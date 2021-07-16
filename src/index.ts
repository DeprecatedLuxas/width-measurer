import { WidthMeasurerOptions, BlockOptions, WidthBlockObject } from "./types";
import PuppeteerBuilder from "./puppeteerBuilder";
import {
    getUnicodeBlocks,
    saveWidthBlockToFile,
    getWidthTable,
    binarySearch,
    isAControlChar,
    getCorrectFileName,
} from "./utils";
import * as path from "path";
import * as fs from "fs";

import defaultBasicLatin from "./defaultBasicLatin";

export class WidthMeasurer {
    private options: WidthMeasurerOptions;

    constructor(options?: WidthMeasurerOptions) {
        this.options = options || {
            startWhenFileExists: true,
            defaultOutputPath: "./",
        };
    }

    public async create(
        unicodeBlock: string | string[],
        options: BlockOptions = {},
        bypassStart?: boolean
    ): Promise<void> {
        try {
            if (this.options.startWhenFileExists || bypassStart) {
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
            } else {
                const outputFolder = path.resolve(
                    this.options.defaultOutputPath ?? "./"
                );
                if (Array.isArray(unicodeBlock)) {
                    for (const block of unicodeBlock) {
                        const unicodeBlockSearch = getUnicodeBlocks(block);
                        const correctFileName = getCorrectFileName(
                            unicodeBlockSearch[0].name,
                            options.font ?? "10px sans-serif"
                        );
                        const outputBlockPath = path.join(
                            outputFolder,
                            correctFileName.replace(/_/g, "-")
                        );
                        if (!fs.existsSync(outputBlockPath))
                            return this.create(unicodeBlock, options, true);
                    }
                } else {
                    const unicodeBlockSearch = getUnicodeBlocks(unicodeBlock);
                    const correctFileName = getCorrectFileName(
                        unicodeBlockSearch[0].name,
                        options.font ?? "10px sans-serif"
                    );
                    const outputBlockPath = path.join(
                        outputFolder,
                        correctFileName.replace(/_/g, "-")
                    );

                    if (!fs.existsSync(outputBlockPath))
                        return this.create(unicodeBlock, options, true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    public load(path: string): WidthBlockObject | undefined {
        return getWidthTable(this.options.defaultOutputPath ?? "./", path);
    }

    public getAvailableLoads(): string[] {
        if (!fs.existsSync(this.options.defaultOutputPath ?? "./")) {
            return [];
        }

        return fs.readdirSync(this.options.defaultOutputPath ?? "./");
    }

    public measure(
        text: string,
        widthTable: WidthBlockObject | undefined
    ): string {
        widthTable = widthTable ?? (defaultBasicLatin as WidthBlockObject);

        return Array.from(text).reduce(
            (acummWidth: string, char: string): string => {
                const charCode: number | undefined = char.codePointAt(0) ?? 32; // If char is undefined it defaults to whitespace in the basic latin.
                if (widthTable === undefined)
                    throw new Error(
                        "widthTable is somehow undefined, please report this."
                    );
                widthTable.name = widthTable?.name ?? defaultBasicLatin.name;
                let characterWidth: number;
                if (isAControlChar(widthTable?.name, charCode)) {
                    characterWidth = 0.0;
                } else {
                    characterWidth =
                        widthTable?.widths[
                            binarySearch(widthTable.widths, charCode)
                        ].width;
                }
                return (parseFloat(acummWidth) + characterWidth).toString();
            },
            "0.00"
        );
    }
}
