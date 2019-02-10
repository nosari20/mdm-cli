# Cli

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.3.
It also uses [Electron](https://electronjs.org/) to be able to run it as standalone multi-platform application.

## Installation

- Install [NodeJS](https://nodejs.org) with [NPM](https://www.npmjs.com/) (include in the NodeJS installer)
- Run ````npm install````

## Run

Run `npm run electron` for dev purposes.


## Prod build

Run `npm run electron:win-build` in order to create the Windows build (located in `electron/build/prod`).


## Code architecture
````
.
+-- package.json (dependencies and npm scripts)
+-- src (Angular related files)
|   +-- app (Code in ts/scss/html format)
|   |     +-- components (Angular reusable commponents)
|   |     +-- pipes (Angular pipes)
|   |     +-- programs (CLI built-in programs)
|   |     +-- services (Angular services)
|   |     +-- types (Custom types)
|   +-- assets (Static files)
+-- electron (Electron related code)
|   +-- helpers (Helpers functions)
|   +-- main.js (Electron entry file)
````

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

