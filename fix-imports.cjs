const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk("./server"), ...walk("./api"), ...walk("./shared")];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  const newContent = content
    .replace(/(import\s+[^'"]+?from\s+["'](\.\.?\/[^'"]+)["'])/g, (match, full, p1) => {
      if (p1.endsWith(".js") || p1.endsWith(".ts") || p1.endsWith(".json")) return full;
      return full.replace(p1, p1 + ".js");
    })
    .replace(/(export\s+[^'"]+?from\s+["'](\.\.?\/[^'"]+)["'])/g, (match, full, p1) => {
      if (p1.endsWith(".js") || p1.endsWith(".ts") || p1.endsWith(".json")) return full;
      return full.replace(p1, p1 + ".js");
    })
    .replace(/(await\s+import\(\s*["'](\.\.?\/[^'"]+)["']\s*\))/g, (match, full, p1) => {
       if (p1.endsWith(".js") || p1.endsWith(".ts") || p1.endsWith(".json")) return full;
       return match.replace(p1, p1 + ".js");
    });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, "utf8");
    console.log("Updated: " + file);
  }
});
