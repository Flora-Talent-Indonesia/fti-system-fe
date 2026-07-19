const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('..', 'Gada-Wirya-Karsa', 'gada-system-fe', 'src', 'app', 'admin-dashboard');
const destDir = path.resolve('.', 'src', 'app', 'guru-dashboard');

const dirsToCopy = ['progress-belajar'];

const replacements = [
  { from: /text-blue-900/g, to: 'text-[#fc809f]' },
  { from: /text-blue-800/g, to: 'text-[#fc809f]' },
  { from: /text-blue-700/g, to: 'text-[#fc809f]' },
  { from: /text-blue-600/g, to: 'text-[#fc809f]' },
  { from: /bg-blue-50/g, to: 'bg-[#fc809f]/10' },
  { from: /bg-blue-100/g, to: 'bg-[#fc809f]/20' },
  { from: /bg-blue-600/g, to: 'bg-[#fc809f]' },
  { from: /bg-blue-700/g, to: 'bg-[#fc809f]' },
  { from: /bg-blue-800/g, to: 'bg-[#fc809f]' },
  { from: /border-blue-100/g, to: 'border-[#fc809f]/20' },
  { from: /border-blue-200/g, to: 'border-[#fc809f]/30' },
  { from: /border-blue-300/g, to: 'border-[#fc809f]/40' },
  { from: /border-blue-500/g, to: 'border-[#fc809f]/60' },
  { from: /border-blue-600/g, to: 'border-[#fc809f]' },
  { from: /border-blue-700/g, to: 'border-[#fc809f]' },
  { from: /border-blue-800/g, to: 'border-[#fc809f]' },
  { from: /border-blue-900/g, to: 'border-[#fc809f]' },
  { from: /ring-blue-500/g, to: 'ring-[#fc809f]/50' },
  { from: /ring-blue-600/g, to: 'ring-[#fc809f]' },
  { from: /bg-\[\#FDFBF7\]/g, to: 'bg-[#fdf8fa]' },
  { from: /\/admin-dashboard\/dashboard/g, to: '/guru-dashboard' },
  { from: /\/admin-dashboard\/progress-belajar/g, to: '/guru-dashboard/progress-belajar' },
];

function copyAndReplace(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyAndReplace(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Do replacements
      for (const rule of replacements) {
        content = content.replace(rule.from, rule.to);
      }
      
      fs.writeFileSync(destPath, content, 'utf8');
      console.log(`Berhasil menyalin & menyesuaikan tema: ${destPath}`);
    }
  }
}

console.log('Mulai menyalin folder...');
for (const dir of dirsToCopy) {
  const source = path.join(srcDir, dir);
  const destination = path.join(destDir, dir);
  if (fs.existsSync(source)) {
    copyAndReplace(source, destination);
  } else {
    console.error(`Folder sumber tidak ditemukan: ${source}`);
  }
}
console.log('Selesai menyalin dan menyesuaikan warna!');
