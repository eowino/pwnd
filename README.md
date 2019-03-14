<h1 align="center">
  pwnd
</h1>

<h4 align="center">
  🔍 A CLI that checks if your passwords have been compromised in a data breach
</h4>

## Description

A simple CLI tool that takes a list of passwords as shown below, queries the [haveibeenpwned](https://haveibeenpwned.com/) API and lets you know if they have been compromised in a data breach.

## Install

```bash
npm install pwnd
```

You can also use `npx` if you're using npm version `npm@5.2.0` and above

```bash
npx pwnd password1 reallylongpasswordoverhere other etc.
```

## Usage

```bash
pwnd password1 reallylongpasswordoverhere other etc.
```

or

Create a `pwnd-config.json` file with a property called `passwords` that's mapped to an array of passwords like so:

```json
{
  "passwords": ["password1", "reallylongpasswordoverhere", "other", "etc."]
}
```

Once you have created the `pwnd-config.json` file, simply run `pwnd` (with no arguments) in the same directory as the `pwnd-config.json` file like so:

```bash
pwnd
```

## License

MIT © [Evans Owino](https://github.com/eowino)
