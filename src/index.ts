import axios, { AxiosPromise } from 'axios';
import sha1 from 'sha1';
import signale from 'signale';

interface IResponse {
  data: string;
}

const URL = 'https://api.pwnedpasswords.com/range/';
const NO_PASSWORDS_PROVIDED = 'Please provide a list of passwords to check';

let passwords: string[] = [];
let hashedPasswords: string[] = [];

function fetchPasswordRange(hashSubstr: string) {
  return axios.get(`${URL}${hashSubstr}`);
}

function parseArgs() {
  passwords = process.argv.slice(2);
  if (!passwords.length) {
    signale.error(NO_PASSWORDS_PROVIDED);
    process.exit();
  }
}

function getParsedResponse(response: IResponse): string[] {
  return response.data.split('\r\n');
}

function findMatch(hashedPassword: string, possibleHashes: string[]) {
  return possibleHashes.find(possibleHash => {
    const [hash] = possibleHash.split(':');
    return hashedPassword.includes(hash);
  });
}

function logResult(password: string, foundHash: string) {
  if (foundHash) {
    const [hash, count] = foundHash.split(':');
    signale.warn(`The following password was found: ${password}`);
    signale.warn(`Hash: ${hash}, Occurence: ${count}\n`);
  } else {
    signale.success(`The following password was not found: ${password}`);
  }
}

async function safeFetchResults(promises: Array<AxiosPromise<any>>) {
  try {
    const responses = await Promise.all(promises);
    return responses;
  } catch (e) {
    signale.error(`Error fetching results: ${e.message}`);
    process.exit();
  }
}

async function run() {
  parseArgs();
  hashedPasswords = passwords.map(password =>
    (sha1(password) as string).toUpperCase(),
  );
  const fetchResults = hashedPasswords.map(hashedPassword =>
    fetchPasswordRange(hashedPassword.substring(0, 5)),
  );
  const responses = await safeFetchResults(fetchResults);
  const possibleHashes = responses.map(response => getParsedResponse(response));

  console.log();
  for (let i = 0; i < hashedPasswords.length; i++) {
    const match = findMatch(hashedPasswords[i], possibleHashes[i]);
    logResult(passwords[i], match);
  }
}

run();
