# `tsc`-only demo

Compares what `tsc` emits for `const enum` vs plain `enum` member access,
with no bundler in the picture.

```sh
npm install
npm run build   # tsc, emits dist/*.js
npm run show    # cat both files
```

Source: two files with identical bodies, importing from different ambient
module declarations.

```ts
// src/const-enum-form.ts
import { ButtonSizes, OptionTypes } from "betterdiscord-const";
export const size = ButtonSizes.SMALL;
export const optionType = OptionTypes.STRING;
```

```ts
// src/plain-enum-form.ts
import { ButtonSizes, OptionTypes } from "betterdiscord-plain";
export const size = ButtonSizes.SMALL;
export const optionType = OptionTypes.STRING;
```

Output:

```js
// dist/const-enum-form.js
export const size = "bd-button-small" /* ButtonSizes.SMALL */;
export const optionType = 3 /* OptionTypes.STRING */;
```

```js
// dist/plain-enum-form.js
import { ButtonSizes, OptionTypes } from "betterdiscord-plain";
export const size = ButtonSizes.SMALL;
export const optionType = OptionTypes.STRING;
```

`const enum`: values inlined, import erased. Plain `enum`: property access
preserved, runtime export required. This inlining is a `tsc`-only feature;
under Vite/esbuild (see sibling demos), both forms emit the same property
access.
