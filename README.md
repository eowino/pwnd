<h1 align="center">
  pwnd
</h1>

<h4 align="center">
  🔍 🔓 A CLI that checks if your passwords have been compromised in a data breach
</h4>

<p align='center'>
<img src="https://user-images.githubusercontent.com/9787512/54433310-72fb2580-4723-11e9-8bad-58c388f56314.gif" width='640' alt='npx pwnd' />
</p>

## Description

A simple CLI tool that takes a list of passwords as shown below, queries the [haveibeenpwned](https://haveibeenpwned.com/) API and lets you know if they have been compromised in a data breach.

## Why

Use a password that has yet to be leaked in a breach.

## How

You provide one or more passwords which are hashed using SHA-1 (it's ok as the password isn't stored anywhere).
Then using a system called `k-anonymity`, only the first five characters of your hashed password are used to query the
`pwned` API which subsequently returns a set of hashed passwords that **might** match a given password.

The actually checking to see if a given password has been breached happens locally so your actual passwords are **never**
sent anywhere ([read more](https://www.troyhunt.com/ive-just-launched-pwned-passwords-version-2)).


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
