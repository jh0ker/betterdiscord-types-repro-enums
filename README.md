# `const enum` vs `enum` in `betterdiscord-types`

Minimum repro for [Zerthox/betterdiscord-types#14](https://github.com/Zerthox/betterdiscord-types/pull/14).

Each demo is a self-contained project. The bundler demos build to a single
`dist/EnumDemo.plugin.js` (BetterDiscord plugin shape: IIFE, no HTML, `BdApi`
as a global). All seven demos share the same `src/index.ts`; only the
`enum` keyword in `src/global.d.ts`, the `isolatedModules` setting, and the
build tool vary.

| Folder | Tool | Form | `isolatedModules` | `npm run build` |
|---|---|---|---|---|
| [`vite-const-enum-broken/`](./vite-const-enum-broken) | Vite | `const enum` | `true` | ❌ `TS2748` |
| [`vite-plain-enum-works/`](./vite-plain-enum-works) | Vite | `enum` | `true` | ✅ |
| [`vite-const-enum-no-isolated-modules/`](./vite-const-enum-no-isolated-modules) | Vite | `const enum` | `false` | ✅ — bundle byte-identical to `vite-plain-enum-works` |
| [`webpack-const-enum-broken/`](./webpack-const-enum-broken) | webpack + ts-loader | `const enum` | `true` | ❌ `TS2748` |
| [`webpack-plain-enum-works/`](./webpack-plain-enum-works) | webpack + ts-loader | `enum` | `true` | ✅ |
| [`tsc-only-const-enum/`](./tsc-only-const-enum) | `tsc` only | `const enum` | `false` | ✅ — values inlined |
| [`tsc-only-plain-enum/`](./tsc-only-plain-enum) | `tsc` only | `enum` | `false` | ✅ — property access preserved |

## Run

```sh
cd <folder>
npm install
npm run build
```

For the bundler demos, output is `dist/EnumDemo.plugin.js`. For the
`tsc-only-*` demos, output is `dist/index.js`; `npm run show` prints it.

## What each demo shows

### `vite-const-enum-broken/`

Reproduces the original error from PR #14:

```
src/index.ts(1,14): error TS2748: Cannot access ambient const enums when 'isolatedModules' is enabled.
src/index.ts(2,20): error TS2748: Cannot access ambient const enums when 'isolatedModules' is enabled.
```

### `vite-plain-enum-works/`

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

### `vite-const-enum-no-isolated-modules/`

`const enum` with `isolatedModules: false`. Build passes. The emitted
`dist/EnumDemo.plugin.js` is **byte-identical** to `vite-plain-enum-works/`.
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

### `tsc-only-const-enum/`

`tsc` directly (no bundler) with `const enum` declarations. tsc inlines
the values; `BdApi` is never referenced for the enum reads:

```js
const size = "bd-button-small" /* BdApi.Components.Button.Sizes.SMALL */;
const optionType = 3 /* BdApi.Commands.OptionTypes.STRING */;
```

### `tsc-only-plain-enum/`

`tsc` directly with plain `enum`. tsc emits the property access verbatim:

```js
const size = BdApi.Components.Button.Sizes.SMALL;
const optionType = BdApi.Commands.OptionTypes.STRING;
```

This file works at runtime in BD because `BdApi` is provided as a global
and the runtime objects exist.

## On StackBlitz

- [`vite-const-enum-broken/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/vite-const-enum-broken)
- [`vite-plain-enum-works/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/vite-plain-enum-works)
- [`vite-const-enum-no-isolated-modules/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/vite-const-enum-no-isolated-modules)
- [`webpack-const-enum-broken/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/webpack-const-enum-broken)
- [`webpack-plain-enum-works/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/webpack-plain-enum-works)
- [`tsc-only-const-enum/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/tsc-only-const-enum)
- [`tsc-only-plain-enum/`](https://stackblitz.com/github/jh0ker/betterdiscord-types-repro-enums/tree/main/tsc-only-plain-enum)

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
