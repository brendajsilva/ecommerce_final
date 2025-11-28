const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'frontend', 'style.css');
try {
  const s = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  let stack = [];
  let problems = [];
  s.forEach((line, i) => {
    for (const ch of line) {
      if (ch === '{') stack.push(i + 1);
      else if (ch === '}') {
        if (stack.length) stack.pop();
        else problems.push(`Unmatched closing brace at line ${i + 1}`);
      }
    }
  });
  if (stack.length) stack.slice().reverse().forEach(ln => problems.push(`Unclosed opening brace at line ${ln}`));
  if (problems.length) console.log(problems.join('\n'));
  else console.log('OK: braces balanced');
} catch (e) {
  console.error('ERROR:', e.message);
  process.exit(2);
}
