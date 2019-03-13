import axios from "axios";
import sha1 from "sha1";

interface IResponse {
  data: string;
}

const URL = "https://api.pwnedpasswords.com/range/";
const NO_PASSWORDS_PROVIDED = "Please provide a list of passwords to check";
let passwords: string[] = [];
let hashedPasswords: string[] = [];

function fetchPasswordRange(hashSubstr: string) {
  return axios.get(`${URL}${hashSubstr}`);
}

function parseArgs() {
  passwords = process.argv.slice(2);
  if (!passwords.length) {
    console.log(NO_PASSWORDS_PROVIDED);
    process.exit();
  }
}

function getParsedResponse(response: IResponse): string[] {
  try {
    const data = response.data;
    return data.split("\r\n");
  } catch {
    return [];
  }
}

function findMatch(hashedPassword: string, possibleHashes: string[]) {
  return possibleHashes.find(possibleHash => {
    const [hash] = possibleHash.split(":");
    return hashedPassword.includes(hash);
  });
}

function logResult(password: string, foundHash: string) {
  if (foundHash) {
    const [hash, count] = foundHash.split(":");
    console.log(`The following password was found: ${password}`);
    console.log(`Hash: ${hash}, Occurence: ${count}\n`);
  } else {
    console.log(`The following password was not found: ${password}`);
  }
}

async function run() {
  parseArgs();
  hashedPasswords = passwords.map(password =>
    (sha1(password) as string).toUpperCase()
  );
  const fetchResults = hashedPasswords.map(pwd =>
    fetchPasswordRange(pwd.substring(0, 5))
  );
  const responses = await Promise.all(fetchResults);
  const possibleHashes = responses.map(response => getParsedResponse(response));

  for (let i = 0; i < hashedPasswords.length; i++) {
    const match = findMatch(hashedPasswords[i], possibleHashes[i]);
    logResult(passwords[i], match);
  }
}

run();
