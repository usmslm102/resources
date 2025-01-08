const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'resources.md');
const outputFile = path.join(__dirname, '/res-ui/src/assets/resources.json');

const lines = fs.readFileSync(inputFile, 'utf-8').split('\n').filter(line => line.trim() !== '');

const resources = lines.map(line => {
  const match = line.match(/^(?:\d+\.\s*)?(https?:\/\/\S+)\s*(.*)$/);
  if (match) {
    const url = match[1];
    const categories = (match[2].match(/#\w+(?:\/\w+)*/g) || []).map(tag => tag.substring(1));
    return { url, categories };
  }
  return null;
}).filter(item => item !== null);

fs.writeFileSync(outputFile, JSON.stringify(resources, null, 2));
console.log('resources.json has been created successfully.');
