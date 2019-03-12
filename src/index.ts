import axios from "axios";
import sha1 from "sha1";

const URL = "https://api.pwnedpasswords.com/range/";

async function fetchPasswordRange(hashSubstr: string) {
  const res = await axios.get(`${URL}${hashSubstr}`);
  const data: string = res.data;
  return data.split("\r\n");
}

async function run() {
  const passwords: string[] = process.argv.slice(2);
  const hashes: string[] = passwords.map(password =>
    (sha1(password) as string).substr(0, 5)
  );

  for (const hash of hashes) {
    const res = await fetchPasswordRange(hash);
    console.log(res);
  }
}

run();
