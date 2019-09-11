# icon-builder-sncf

## Requirements

- `yarn 1.17.3`
- `node v10.15.3`

## Installation

```bash
$ cd app
$ yarn install
$ yarn svg
```

## How to build

First steps, install dependencies, go inside icon-builder-sncf directory, then :

1. `yarn install` to install Node.js dependencies.
2. `yarn svg` to get bootstrap-sncf icons library.

### Running documentation locally

```bash
# development
$ yarn build

# watch mode
$ yarn start:dev

# production mode
$ start:prod
```

## API

Download assets : `http://0.0.0.0:3000/api/download` with body params.
Today we have:

| Plugin | Description |
| ------ | ----------- |
| icons | Array of icon name |
| font | Boolean |
| png | Boolean |
| svg | Boolean |
| color | Hexa |
| size | Number |