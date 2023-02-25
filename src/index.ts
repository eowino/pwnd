import { join } from 'path';

import type { AxiosPromise } from 'axios';
import axios from 'axios';
import sha1 from 'sha1';
import signale from 'signale';

interface Response {
    data: string;
}

const CONFIG_FILE = 'pwnd-config.json';
const URL = 'https://api.pwnedpasswords.com/range/';
const NO_PASSWORDS_PROVIDED = 'Please provide a list of passwords to query.';
const ATTEMPT_CONFIG = `Attempting to read from ${CONFIG_FILE}`;
const NO_CONFIG = 'Could not find config file here: ';

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

function getParsedResponse(response: Response): string[] {
    return response.data.split('\r\n');
}

function findMatch(hashedPassword: string, possibleHashes: string[]) {
    return possibleHashes.find((possibleHash) => {
        const [hash] = possibleHash.split(':');
        return hashedPassword.includes(hash);
    });
}

function logResult(foundHash: string, index: number) {
    if (foundHash) {
        const [, count] = foundHash.split(':');
        signale.warn(`The password listed at index {${index}} was found`);
        signale.warn(`Occurrence: ${count}\n`);
    } else {
        signale.success(`The password listed at index {${index}} was not found\n`);
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

export async function run() {
    parseArgs();
    hashedPasswords = passwords.map((password) => (sha1(password) as string).toUpperCase());
    const fetchResults = hashedPasswords.map((hashedPassword) => fetchPasswordRange(hashedPassword.substring(0, 5)));
    const responses = await safeFetchResults(fetchResults);
    const possibleHashes = responses.map((response) => getParsedResponse(response));

    console.log();
    for (let index = 0; index < hashedPasswords.length; index++) {
        const match = findMatch(hashedPasswords[index], possibleHashes[index]);
        logResult(match, index);
    }
}
