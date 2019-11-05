# icon-builder-sncf

## Docker build

```bash
$ docker build -t sncf/fonticon .
$ docker run -p 49160:3000 -d sncf/fonticon
```

## Local build

### Requirements

- `yarn 1.17.3`
- `node v10.15.3`
- `git 2.16.2`

### Installation

```bash
$ cd application
$ yarn install
$ yarn svg
```

### How to build

First steps, install dependencies, go inside icon-builder-sncf directory, then :

1. `yarn install` to install Node.js dependencies.
2. `yarn svg` to get bootstrap-sncf icons library.

### Running documentation

```bash
# development
$ yarn build

# watch mode
$ yarn start:dev
```

## API

Download assets : `http://x.x.x.x:3000/api/download` with body params.
Today we have:

| Plugin | Description |
| ------ | ----------- |
| icons | Array of icon name |
| font | Boolean |
| png | Boolean |
| svg | Boolean |
| color | Hexa |
| size | Number |
