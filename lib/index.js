"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const sha1_1 = __importDefault(require("sha1"));
const URL = "https://api.pwnedpasswords.com/range/";
async function fetchPasswordRange(hashSubstr) {
  const res = await axios_1.default.get(`${URL}${hashSubstr}`);
  const data = res.data;
  return data.split("\r\n");
}
async function run() {
  const passwords = process.argv.slice(2);
  const hashes = passwords.map(password =>
    sha1_1.default(password).substr(0, 5)
  );
  for (const hash of hashes) {
    const res = await fetchPasswordRange(hash);
    console.log(res);
  }
}
run();
