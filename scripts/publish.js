const { execSync } = require('child_process');
const path = require('path');

const customMsg = process.argv.slice(2).join(' ') || `content: update media assets (${new Date().toLocaleDateString('en-GB')})`;

console.log('====================================================');
console.log('🚀 Insightforge 1-Click Publisher');
console.log('====================================================');

try {
    // 1. Sync Media to ImageKit and update manifests
    console.log('\n[1/3] ☁️  Uploading new media to ImageKit & updating manifests...');
    execSync('npm run sync:media', {
        cwd: path.join(__dirname, '../backend'),
        stdio: 'inherit'
    });

    // 2. Stage git changes
    console.log('\n[2/3] 📦 Staging changes in Git...');
    execSync('git add .', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });

    // Check if there are changes to commit
    const status = execSync('git status --porcelain', { cwd: path.join(__dirname, '..') }).toString().trim();
    if (status) {
        console.log(`\n[3/3] 🚀 Committing and pushing: "${customMsg}"...`);
        execSync(`git commit -m "${customMsg.replace(/"/g, '\\"')}"`, {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        execSync('git push origin main', {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        console.log('\n====================================================');
        console.log('🎉 SUCCESS! Your new content is live on Vercel!');
        console.log('====================================================');
    } else {
        console.log('\n✨ Everything is already up to date. No new git changes to push.');
    }
} catch (error) {
    console.error('\n❌ Publish failed:', error.message);
    process.exit(1);
}
