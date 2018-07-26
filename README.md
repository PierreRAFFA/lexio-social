# Lexio Social

This microservice is dedicated to share ranking, score etc... in Facebook

## Technical Overview
- NodeJS  
- Typescript  
- AMQPLib  
- Express
- PhantomJS
  
  
## Environment variables

- **NODE_ENV** (production|development)
- **HTTP_PORT** (ex: 80)
- **AMQP_EXCHANGE_HOST** (ex: amqp://user:user@rabbitmq:5672)
- **AMQP_EXCHANGE_NAME** (ex: local)
- **AMQP_QUEUE_NAME** (ex: ms-social)
- **AMQP_DEAD_LETTER_EXCHANGE_NAME** (ex: local-dlx)
- **AMQP_DEAD_LETTER_QUEUE_NAME** (ex: local-dlx-queue)
  
## Setup

```bash
$ npm i
$ npm run build
```
  
## Start the app
```bash
$ npm start
```

### Commands

| Npm Script | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `start`                   | Starts the app. if NODE_ENV is not production, nodemon will watch the files                       |
| `test`                    | Runs tests using Jest test runner                                                                 |
| `watch`                   | Runs all watch tasks (TypeScript, Node).                                                          |
| `debug`                   | Watchs (Chrome debugger can be used)                                                              |
|  |  |
|  |  |
| `serve`                   | Runs node on `dist/server.js` which is the apps entry point                                       |
| `build`                   | Full build. Runs ALL build tasks (`build-sass`, `build-ts`, `tslint`, `copy-static-assets`)       |
| `build-ts`                | Compiles all source `.ts` files to `.js` files in the `dist` folder                               |
| `watch-ts`                | Same as `build-ts` but continuously watches `.ts` files and re-compiles when needed               |
| `tslint`                  | Runs TSLint on project files                                                                      |

## Project Structure

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **node_modules**         | Contains all your npm dependencies                                                            |
| **build**                | Contains the distributable (or output) from your TypeScript build. This is the code you ship  |
| **src**                  | Contains your source code that will be compiled to the dist dir                               |
| **src/base**             | Contains the scaffold source code (Please do not modify theses files)                         |
| **src/config**           | Passport authentication strategies and login middleware. Add other complex config code here   |
| **src/controllers**      | Controllers define functions that respond to an event                                         |
| **src/models**           | Models define Mongoose schemas that will be used in storing and retrieving data from MongoDB  |
| **src/types**            | Holds .d.ts files not found on DefinitelyTyped. Covered more in this [section](#type-definition-dts-files)          |
| **src**/server.ts        | Entry point to the app                                                               |
| **test**                 | Contains your tests. Seperate from source because there is a different build process.         |
| **views**                | Views define how your app renders on the client. In this case we're using pug                 |
| .env.example             | API keys, tokens, passwords, database URI. Clone this, but don't check it in to public repos. |
| jest.config.js           | Used to configure Jest                                                                        |
| package.json             | File that contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)                          |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                               |
| tslint.json              | Config settings for TSLint code style checking                                                |
