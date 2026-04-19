import fs from 'fs';
const part1 = fs.readFileSync('src/AppPart1.jsx', 'utf8');
const part2 = fs.readFileSync('src/AppPart2.jsx', 'utf8');
fs.writeFileSync('src/App.jsx', part1 + '\n' + part2);
