const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, `../src/constants/index.ts`);

const process = require('process');
const args = process.argv;
const network = args[2];
const networkFilePath = './' + network;

fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) throw err;

  let lines = data.split('\n');
  lines.splice(0, 1);
  lines.unshift(`export * from '${networkFilePath}';`);

  let newData = lines.join('\n');
  fs.writeFile(filePath, newData, (err) => {
    if (err) throw err;
    console.log('The file has been updated');
  });
});
