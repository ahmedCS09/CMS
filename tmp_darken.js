const fs = require('fs');
const path = require('path');

const classMap = {
    'bg-white': 'bg-slate-900',
    'bg-[#f8fafc]': 'bg-slate-950',
    'bg-slate-50': 'bg-slate-950',
    'bg-white/90': 'bg-slate-900/90',
    'bg-white/60': 'bg-slate-900/60',
    'border-white/80': 'border-slate-800/80',
    'bg-slate-50/50': 'bg-slate-950/50',
    'border-slate-100': 'border-slate-800',
    'border-slate-200': 'border-slate-700',
    'border-slate-50': 'border-slate-800',
    'text-slate-900': 'text-white',
    'text-slate-800': 'text-slate-100',
    'text-slate-700': 'text-slate-200',
    'text-slate-600': 'text-slate-300',
    'text-slate-500': 'text-slate-400',
    'text-slate-400': 'text-slate-500',
    'hover:border-slate-200': 'hover:border-slate-700',
    'hover:bg-slate-50': 'hover:bg-slate-800',
    'hover:bg-white': 'hover:bg-slate-800',
    'focus:bg-white': 'focus:bg-slate-900',
    'bg-indigo-50': 'bg-indigo-500/10',
    'border-indigo-100': 'border-indigo-500/20',
    'hover:shadow-slate-200': 'hover:shadow-slate-950/50',
    'shadow-xl': 'shadow-xl shadow-black/40',
    'shadow-sm': 'shadow-sm shadow-black/20'
};

function migrateContent(content) {
    const keys = Object.keys(classMap).sort((a, b) => b.length - a.length);
    let newContent = content;
    keys.forEach(key => {
        // This regex ensures we only match the whole class name.
        const regex = new RegExp(`(?<=[\\s"'\\\`])(${key.replace(/[/.]/g, '\\$&')})(?=[\\s"'\\\`])`, 'g');
        newContent = newContent.replace(regex, classMap[key]);
    });
    return newContent;
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Ignore node_modules, .git, .next
            if (!['node_modules', '.git', '.next'].includes(file)) {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            // Skip AdminSidebar because we specifically styled it manually 
            if (file === 'AdminSidebar.js' || file === 'layout.js') continue;
            
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = migrateContent(content);
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'app'));
