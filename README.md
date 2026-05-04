# `const enum` vs `enum` in `betterdiscord-types`

Minimum repro for [Zerthox/betterdiscord-types#14](https://github.com/Zerthox/betterdiscord-types/pull/14).

Each demo is a self-contained project that builds to a single
`dist/EnumDemo.plugin.js` (BetterDiscord plugin shape: IIFE, no HTML, `BdApi`
as a global). The demos vary only in the `enum` keyword, the
`isolatedModules` setting, and the bundler.

| Folder | Bundler | Form | `isolatedModules` | `npm run build` |
|---|---|---|---|---|
| [`const-enum-broken/`](./const-enum-broken) | Vite | `const enum` | `true` | ❌ `TS2748` |
| [`plain-enum-works/`](./plain-enum-works) | Vite | `enum` | `true` | ✅ |
| [`const-enum-no-isolated-modules/`](./const-enum-no-isolated-modules) | Vite | `const enum` | `false` | ✅ — bundle byte-identical to `plain-enum-works` |
| [`webpack-const-enum-broken/`](./webpack-const-enum-broken) | webpack + ts-loader | `const enum` | `true` | ❌ `TS2748` |
| [`webpack-plain-enum-works/`](./webpack-plain-enum-works) | webpack + ts-loader | `enum` | `true` | ✅ |
| [`tsc-only/`](./tsc-only) | none (`tsc` only) | both | n/a | ✅ — shows inlining vs property access |

## Run

```sh
cd <folder>
npm install
npm run build
```

For the bundler demos, the output is `dist/EnumDemo.plugin.js`. For
`tsc-only`, output is two `.js` files in `dist/`; `npm run show` prints them.

## What each demo shows

### `const-enum-broken/` (Vite)

Reproduces the original error from PR #14:

```
src/index.ts(1,14): error TS2748: Cannot access ambient const enums when 'isolatedModules' is enabled.
src/index.ts(2,20): error TS2748: Cannot access ambient const enums when 'isolatedModules' is enabled.
```

### `plain-enum-works/` (Vite)

Same source, plain `enum` instead of `const enum`. Build passes; bundle:

```js
(function() {
  "use strict";
  const size = BdApi.Components.Button.Sizes.SMALL;
  const optionType = BdApi.Commands.OptionTypes.STRING;
  ...
})();
```

The `BdApi.X.Y.Z` accesses are preserved as runtime property reads.

### `const-enum-no-isolated-modules/` (Vite)

`const enum` with `isolatedModules: false`. Build passes. The emitted
`dist/EnumDemo.plugin.js` is **byte-identical** to `plain-enum-works/`.
Vite uses esbuild, esbuild can't see ambient `.d.ts`, so it emits the
property access regardless of `const`.

### `webpack-const-enum-broken/`

Same `const enum` source as the Vite version, built with webpack +
ts-loader. The build fails the same way — TS2748 is raised by `tsc`
(in the `tsc && webpack` script) and again by ts-loader itself if you
run `webpack` alone:

```
[tsl] ERROR in src/index.ts(1,14)
      TS2748: Cannot access ambient const enums when 'isolatedModules' is enabled.
```

So the breakage isn't Vite-specific; ts-loader enforces the same rule.

### `webpack-plain-enum-works/`

Plain `enum` + webpack + ts-loader. Build passes. Webpack's runtime
wrapper is more verbose than Vite's IIFE, but the relevant emitted code
is the same property access:

```js
const size = BdApi.Components.Button.Sizes.SMALL;
const optionType = BdApi.Commands.OptionTypes.STRING;
```

### `tsc-only/`

Two source files import from a `const enum` and a plain `enum`
declaration respectively, then build with `tsc` (no bundler). The emitted
`.js` files differ:

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

`const enum` lets `tsc` inline values and erase the import. Plain `enum`
keeps the property access, which requires the runtime to provide the
enum object — which BetterDiscord does
(`BdApi.Components.Button.Sizes` is a real object on the live runtime).

## On StackBlitz

- [`const-enum-broken/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/const-enum-broken)
- [`plain-enum-works/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/plain-enum-works)
- [`const-enum-no-isolated-modules/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/const-enum-no-isolated-modules)
- [`webpack-const-enum-broken/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/webpack-const-enum-broken)
- [`webpack-plain-enum-works/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/webpack-plain-enum-works)
- [`tsc-only/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/tsc-only)

## Setup notes

- Vite demos use library mode with IIFE format, mirroring how a
  BetterDiscord plugin is typically built.
- Webpack demos use ts-loader with `compilerOptions: { noEmit: false }`
  passed inline (the project's `tsconfig.json` keeps `noEmit: true` so
  the standalone `tsc` step in `npm run build` is type-check-only).
- `BdApi` is declared as a global in `src/global.d.ts`. The bundle
  references it as a free identifier; assuming BD provides it at runtime.
- The enum types are declared inside `declare global { ... }` so the access
  pattern (`BdApi.Components.Button.Sizes.SMALL`) matches real plugin code.
