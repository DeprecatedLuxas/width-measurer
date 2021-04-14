import * as puppeteer from "puppeteer";
import { WidthBlockObject } from "./types";

export default class PuppeteerBuilder {
    public font: string;
    public puppeteerBrowser: puppeteer.Browser | undefined;
    public puppeteerPage: puppeteer.Page | undefined;

    constructor(font: string) {
        this.font = font;
        this.puppeteerBrowser = undefined;
        this.puppeteerPage = undefined;
    }

    async initPuppeteer(): Promise<void> {
        this.puppeteerBrowser = await puppeteer.launch();

        this.puppeteerPage = await this.puppeteerBrowser.newPage();

        await this.puppeteerPage.evaluate(() => {
            return document.body.appendChild(document.createElement("canvas"));
        });
    }

    async widthOf(text: string): Promise<number | undefined> {
        const { font } = this;
        if (this.puppeteerPage !== undefined) {
            return this.puppeteerPage.evaluate(
                ({ text, font }) => {
                    const canvas: HTMLCanvasElement =
                        document.getElementsByTagName("canvas")[0] ??
                        document.body.appendChild(
                            document.createElement("canvas")
                        );
                    const ctx: CanvasRenderingContext2D | null = canvas.getContext(
                        "2d"
                    );

                    if (ctx === null) return undefined;
                    ctx.font = font;
                    return ctx.measureText(text).width;
                },
                { text, font }
            );
        }
    }

    async widthOfRange(blockName: string, first: number, last: number): Promise<WidthBlockObject> {
        const widthBlockObject: WidthBlockObject = {
            name: blockName,
            font: this.font,
            widths: [],
        };
        let charCode: number = first;
        let char: string;

        for (charCode; charCode < last; ++charCode) {
            char = String.fromCharCode(charCode);

            let value: number | undefined = await this.widthOf(char);
            if (charCode < 32) {
                value = 0.0;
            }

            widthBlockObject.widths.push({
                charCode: charCode,
                char: char,
                width: parseFloat(String(value?.toFixed(2))),
            });
        }

        return widthBlockObject;
    }

    async destroyPuppeteer(): Promise<void> {
        if (this.puppeteerBrowser !== undefined) {
            console.log("Puppeteer Browser is now destroyed.");
            await this.puppeteerBrowser.close();
        } else {
            console.log("Puppeteer Browser is undefined.");
        }
    }
}
