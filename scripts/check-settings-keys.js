const fs = require("fs");
const content = fs.readFileSync("src/app/admin/(protected)/settings/page.tsx", "utf-8");
const regex = /t\("([^"]+)"/g;
const keys = new Set();
let m;
while ((m = regex.exec(content)) !== null) keys.add(m[1]);
console.log([...keys].sort().join("\n"));
