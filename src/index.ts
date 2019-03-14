import axios, { AxiosPromise } from 'axios';
import { join } from 'path';
import sha1 from 'sha1';
import signale from 'signale';

interface IResponse {
  data: string;
}

const CONFIG_FILE = 'pwnd-config.json';
const URL = 'https://api.pwnedpasswords.com/range/';
const NO_PASSWORDS_PROVIDED = 'Please provide a list of passwords to query.';
const ATTEMPT_CONFIG = `Attempting to read from ${CONFIG_FILE}`;
const NO_CONFIG = `Could not find config file here: `;

let passwords: string[] = [];
let hashedPasswords: string[] = [];

function fetchPasswordRange(hashSubstr: string) {
  return axios.get(`${URL}${hashSubstr}`);
}

function parseArgs() {
  passwords = process.argv.slice(2);
  if (!passwords.length) {
    signale.info(ATTEMPT_CONFIG);
    console.log();
    readConfigFile();
  }
}

function readConfigFile() {
  const CWD = process.cwd();
  try {
    const pathToConfig = join(CWD, CONFIG_FILE);
    const config = require(pathToConfig);
    passwords = config.passwords;
  } catch {
    signale.error(NO_PASSWORDS_PROVIDED);
    signale.error(`${NO_CONFIG} ${CWD}`);
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
