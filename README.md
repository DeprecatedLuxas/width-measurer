# width-measure

## Installation

Using NPM
```bash
$ npm install @deprecatedluxas/width-measurer
```

Using Yarn
```bash
$ yarn add @deprecatedluxas/width-measurer
```

## Usage

```js
import { WidthMeasurer } from "@deprecatedluxas/width-measurer";


const measure = new WidthMeasurer({
    defaultOutputPath: "./widths", // Where the width blocks will be stored.
});

await measure.create("Basic Latin", {
    font: "10px Verdana"
});
// When creating a width block, the name of the file is the width block type and the font.
// example: basic-latin-10px-verdana.json

const textWidth = measure.measure("hello", measure.load("basic-latin-10px-verdana.json"));
// returns 23.84
```

## License
[MIT](LICENSE)