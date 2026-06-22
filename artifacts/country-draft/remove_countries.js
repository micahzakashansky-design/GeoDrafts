const fs = require('fs');

const file = 'src/data/countries.ts';
let content = fs.readFileSync(file, 'utf8');

const toRemove = [
  "Georgia", "Armenia", "Kuwait", "Oman", "Jordan", "Bahrain", "Lebanon", "Azerbaijan", "Uzbekistan",
  "Kenya", "Tunisia", "Mauritius", "Ghana", "Senegal", "Tanzania", "Uganda", "Ivory Coast", "Rwanda",
  "Romania", "Hungary", "Slovakia", "Slovenia", "Cyprus", "Bulgaria", "Serbia", "Malta", "Belarus",
  "Uruguay", "Costa Rica", "Panama", "Dominican Republic", "Jamaica", "Bolivia", "Cuba", "El Salvador", "Guatemala", "Honduras", "Paraguay",
  "Malaysia", "Thailand", "Vietnam", "Sri Lanka", "Bangladesh",
  "Latvia", "Lithuania"
];

let newContent = content;

toRemove.forEach(country => {
  // We look for:
  //   {
  //     name: "Country",
  // ... until the next `  },`
  const regex = new RegExp(`  \\{\\n    name: "${country}",[\\s\\S]*?\\n  \\},?\\n`, 'g');
  newContent = newContent.replace(regex, '');
});

fs.writeFileSync(file, newContent);
console.log('Removed countries.');
