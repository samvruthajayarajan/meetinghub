const fs = require('fs');
const path = require('path');

// Color replacements mapping
const replacements = [
  // Backgrounds
  { from: /bg-slate-900/g, to: 'bg-white' },
  { from: /bg-slate-800/g, to: 'bg-white' },
  { from: /bg-slate-700/g, to: 'bg-purple-50' },
  { from: /bg-slate-600/g, to: 'bg-purple-100' },
  { from: /bg-slate-500/g, to: 'bg-purple-200' },
  
  // Text colors
  { from: /text-white/g, to: 'text-purple-900' },
  { from: /text-slate-300/g, to: 'text-purple-700' },
  { from: /text-slate-400/g, to: 'text-purple-600' },
  { from: /text-slate-500/g, to: 'text-purple-500' },
  
  // Borders
  { from: /border-slate-700/g, to: 'border-purple-200' },
  { from: /border-slate-600/g, to: 'border-purple-300' },
  { from: /border-slate-500/g, to: 'border-purple-400' },
  
  // Buttons - Blue to Purple
  { from: /bg-blue-600/g, to: 'bg-purple-600' },
  { from: /hover:bg-blue-700/g, to: 'hover:bg-purple-700' },
  { from: /bg-blue-500/g, to: 'bg-purple-500' },
  { from: /hover:bg-blue-600/g, to: 'hover:bg-purple-600' },
  
  // Buttons - Cyan to Purple
  { from: /bg-cyan-600/g, to: 'bg-purple-400' },
  { from: /hover:bg-cyan-700/g, to: 'hover:bg-purple-500' },
  { from: /bg-cyan-500/g, to: 'bg-purple-400' },
  
  // Focus rings
  { from: /focus:ring-blue-500/g, to: 'focus:ring-purple-500' },
  { from: /ring-blue-500/g, to: 'ring-purple-500' },
  
  // Shadows
  { from: /shadow-blue-500/g, to: 'shadow-purple-500' },
  { from: /shadow-cyan-500/g, to: 'shadow-purple-400' },
  
  // Gradients
  { from: /from-blue-500 to-cyan-500/g, to: 'from-purple-400 to-pink-400' },
  { from: /from-blue-600 to-cyan-600/g, to: 'from-purple-500 to-pink-500' },
  
  // Hover states
  { from: /hover:bg-slate-700/g, to: 'hover:bg-purple-100' },
  { from: /hover:bg-slate-600/g, to: 'hover:bg-purple-200' },
  { from: /hover:bg-slate-500/g, to: 'hover:bg-purple-300' },
  
  // Border hover
  { from: /hover:border-blue-500/g, to: 'hover:border-purple-500' },
  
  // Placeholder colors
  { from: /placeholder-slate-400/g, to: 'placeholder-purple-400' },
  { from: /placeholder-slate-500/g, to: 'placeholder-purple-500' },
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
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
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
      // Skip node_modules and .next directories
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
console.log('🎨 Starting theme color update...\n');

const appDir = path.join(__dirname, '../app');
const componentsDir = path.join(__dirname, '../components');

let totalUpdated = 0;

if (fs.existsSync(appDir)) {
  console.log('Updating app directory...');
  totalUpdated += walkDirectory(appDir);
}

if (fs.existsSync(componentsDir)) {
  console.log('\nUpdating components directory...');
  totalUpdated += walkDirectory(componentsDir);
}

console.log(`\n✨ Theme update complete! Updated ${totalUpdated} files.`);
console.log('\n📝 Next steps:');
console.log('1. Restart your development server');
console.log('2. Check the browser for the new purple theme');
console.log('3. Review any components that might need manual adjustment');
