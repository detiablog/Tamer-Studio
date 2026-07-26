const fs = require("fs");
const c = fs.readFileSync("locales/en.json", "utf-8");
const keys = ["email.addProvider", "email.noProviders", "email.testing", "email.statusUpdated", "settings.saveFailed"];
for (const k of keys) {
  if (!c.includes('"' + k + '"')) {
    console.log("MISSING:", k);
  }
}
