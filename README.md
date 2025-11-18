# BrunoDoc

This tool generates HTML/Markdown documentation from Bruno collections.

## Limitations:

- Only supports HTTP requests. No support for WebSocket, GraphQL, or other protocols.
- Exports only Params, Body, Headers, Auth, Docs tabs from Bruno requests.
- Renders docs with environment variables replaced by their values in URLs. You need to set the environment to use on command line.

## Installation

You can install BrunoDoc globally by cloning the repository and running:

```bash
npm install -g
```

## Command Line Usage

Currently, there is one command available: `build`. Available build options are:

- `-i, --input <path>`
  **Description:** Bruno directory path
  **Default:** `./Collection`

- `-o, --output <path_or_file>`
  **Description:** Output documentation path or file name
  **Default:** `./docs`

- `-f, --format <type>`
  **Description:** Output format (`html` or `md`)
  **Default:** `html`

  After the semicolon, you can specify additional format template. Currently the only supported option for `html` is `embed`, which generates HTML file without <html>, <body> tags.
  This is useful when embedding the generated documentation into an existing HTML page. By default, a full HTML document is generated.

- `-e, --env <name>`
  **Description:** Environment name to use for variable substitution

- `-x, --exclude <patterns...>`
  **Description:** Exclude certain files or directories

- `-v, --verbose`
  **Description:** Verbose output
  **Default:** `false`

Command example:

```
npx brunodoc build -i api/bruno --output api/index.html --exclude "@*" --env "Production" --format html:embed
```

This command generates HTML documentation from Bruno collection located in `api/bruno`, using the `Production` environment for variable substitution, excluding any files or directories starting with `@` (which might be used to prefix internal API or usage examples, that should'n be included in public documentation), and outputs the result to `api/index.html` in embedded HTML format.
