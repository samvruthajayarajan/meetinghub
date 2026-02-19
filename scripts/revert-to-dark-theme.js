const fs = require('fs');
const path = require('path');

// Revert color replacements - opposite of what we did
const replacements = [
  // Backgrounds - revert
  { from: /bg-white(?!-)/g, to: 'bg-slate-900' },
  { from: /bg-purple-50/g, to: 'bg-slate-700' },
  { from: /bg-purple-100/g, to: 'bg-slate-600' },
  { from: /bg-purple-200/g, to: 'bg-slate-500' },
  
  // Text colors - revert
  { from: /text-purple-900/g, to: 'text-white' },
  { from: /text-purple-700/g, to: 'text-slate-300' },
  { from: /text-purple-600/g, to: 'text-slate-400' },
  { from: /text-purple-500/g, to: 'text-slate-500' },
  
  // Borders - revert
  { from: /border-purple-200/g, to: 'border-slate-700' },
  { from: /border-purple-300/g, to: 'border-slate-600' },
  { from: /border-purple-400/g, to: 'border-slate-500' },
  
  // Buttons - Purple back to Blue
  { from: /bg-purple-600/g, to: 'bg-blue-600' },
  { from: /hover:bg-purple-700/g, to: 'hover:bg-blue-700' },
  { from: /bg-purple-500/g, to: 'bg-blue-500' },
  { from: /hover:bg-purple-600/g, to: 'hover:bg-blue-600' },
  
  // Buttons - Purple back to Cyan
  { from: /bg-purple-400/g, to: 'bg-cyan-600' },
  { from: /hover:bg-purple-500/g, to: 'hover:bg-cyan-700' },
  
  // Focus rings - revert
  { from: /focus:ring-purple-500/g, to: 'focus:ring-blue-500' },
  { from: /ring-purple-500/g, to: 'ring-blue-500' },
  
  // Shadows - revert
  { from: /shadow-purple-500/g, to: 'shadow-blue-500' },
  { from: /shadow-purple-400/g, to: 'shadow-cyan-500' },
  
  // Gradients - revert
  { from: /from-purple-400 to-pink-400/g, to: 'from-blue-500 to-cyan-500' },
  { from: /from-purple-500 to-pink-500/g, to: 'from-blue-600 to-cyan-600' },
  
  // Hover states - revert
  { from: /hover:bg-purple-100/g, to: 'hover:bg-slate-700' },
  { from: /hover:bg-purple-200/g, to: 'hover:bg-slate-600' },
  { from: /hover:bg-purple-300/g, to: 'hover:bg-slate-500' },
  
  // Border hover - revert
  { from: /hover:border-purple-500/g, to: 'hover:border-blue-500' },
  
  // Placeholder colors - revert
  { from: /placeholder-purple-400/g, to: 'placeholder-slate-400' },
  { from: /placeholder-purple-500/g, to: 'placeholder-slate-500' },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Reverted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error reverting ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, filePattern = /\.(tsx|ts|jsx|js)$/) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        updatedCount += walkDirectory(filePath, filePattern);
      }
    } else if (filePattern.test(file)) {
      if (updateFile(filePath)) {
        updatedCount++;
      }
    }
  });
  
  return updatedCount;
}

// Main execution
console.log('🔄 Reverting to original dark theme...\n');

const appDir = path.join(__dirname, '../app');
const componentsDir = path.join(__dirname, '../components');

let totalUpdated = 0;

if (fs.existsSync(appDir)) {
  console.log('Reverting app directory...');
  totalUpdated += walkDirectory(appDir);
}

if (fs.existsSync(componentsDir)) {
  console.log('\nReverting components directory...');
  totalUpdated += walkDirectory(componentsDir);
}

console.log(`\n✨ Revert complete! Updated ${totalUpdated} files back to dark theme.`);
console.log('\n📝 Next steps:');
console.log('1. Restart your development server');
console.log('2. The original dark theme should be restored');
