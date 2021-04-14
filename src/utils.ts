import * as fs from "fs";

import * as path from "path";
import { UnicodeBlock, WidthBlockObject, WidthBlock } from "./types";

const UNFORMAT_REGEX = /_[0-9]+px/g;

export function convertUnicodeBlockName(unicodeBlockName: string): string {
    return unicodeBlockName.replace(/\s/g, "-");
}

export function getUnicodeBlockFile(): string {
    if (fs.existsSync(path.join(__dirname, "unicodeblocks.json"))) {
        return path.join(__dirname, "unicodeblocks.json");
    } else if (
        fs.existsSync(path.join(__dirname, "../blocks/unicodeblocks.json"))
    ) {
        return path.join(__dirname, "../blocks/unicodeblocks.json");
    } else {
        throw new Error("Couldn't locate the unicodeblocks file. Report this.");
    }
}

export function getUnicodeBlocks(
    unicodeBlock: string,
    lowercase?: boolean
): UnicodeBlock[] {
    try {
        const unicodeBlocksObject = JSON.parse(
            fs.readFileSync(getUnicodeBlockFile(), "utf8")
        );
        if (lowercase) {
            return unicodeBlocksObject.blocks.filter(
                (block: UnicodeBlock) =>
                    block.name.toLowerCase() === unicodeBlock.toLowerCase()
            );
        }
        return unicodeBlocksObject.blocks.filter(
            (block: UnicodeBlock) => block.name === unicodeBlock
        );
    } catch (error) {
        console.error(error);
        return [];
    }
}

function getCorrectFileName(blockName: string, font: string): string {
    return `${blockName.toLowerCase()} ${font.toLowerCase()}.json`.replace(
        /\s+/gm,
        "_"
    );
}

function getUnformattedFileName(formattedFileName: string): string {
    let splittedFormattedFileName = formattedFileName.split(UNFORMAT_REGEX)[0]; // It is always the first one in the array
    splittedFormattedFileName = splittedFormattedFileName.replace(/_/g, " ");
    const blocks = getUnicodeBlocks(splittedFormattedFileName, true);
    return blocks[0].name;
}

function getOutputFolder(output: string): string {
    if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
    }
    return output;
}

export function getWidthTable(
    output: string,
    tablePath: string
): WidthBlockObject | undefined {
    try {
        if (!tablePath.includes(".json")) {
            tablePath = tablePath + ".json";
        }
        const outputFolder = path.resolve(getOutputFolder(output), tablePath);
        return JSON.parse(fs.readFileSync(outputFolder, "utf-8"));
    } catch (error) {
        console.log(error);
    }
}

export function binarySearch(sortedArray: WidthBlock[], key: number): number {
    let start = 0;
    let end = sortedArray.length - 1;

    while (start <= end) {
        const middle = Math.floor((start + end) / 2);
        if (sortedArray[middle].charCode === key) {
            return middle;
        } else if (sortedArray[middle].charCode < key) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }
    return -1;
}

export function saveWidthBlockToFile(
    output: string,
    blockFileName: string,
    widthBlockObject: WidthBlockObject
): void {
    try {
        const outputFolder = getOutputFolder(output); // If the folder does not exist, it creates one at the location.

        const outputFolderPath = path.resolve(outputFolder);
        const correctFileName = getCorrectFileName(blockFileName, widthBlockObject.font)
        const outputBlockPath = path.join(
            outputFolderPath,
            correctFileName.replace(
                /_/g,
                "-"
            )
        );

        fs.writeFileSync(
            outputBlockPath,
            JSON.stringify(widthBlockObject, null, 2)
        );
        console.log(`Saved ${getUnformattedFileName(
            correctFileName
        )} to ${outputBlockPath}`)
    } catch (error) {
        console.log(error);
    }
}

export function isAControlChar(widthBlock: string, charCode: number): boolean {
    if (widthBlock === "Basic Latin") {
        return charCode <= 31 || charCode === 127;

    } else if (widthBlock === "Latin-1 Supplement") {
        return charCode <= 159
    }
    return false;
}
