export interface WidthMeasurerOptions {
    defaultOutputPath?: string;
}

export interface BlockOptions {
    font?: string;
}

export type UnicodeBlock = {
    name: string;
    start: string;
    end: string;
};

export interface WidthBlockObject {
    name: string;
    font: string;
    widths: WidthBlock[];
}

export type WidthBlock = {
    charCode: number;
    char: string;
    width: number;
};

export type WidthBlockArray = (string | number | undefined)[][];
