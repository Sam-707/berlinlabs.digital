// Quick deployment script to update the working 3rbst.com webhook
// This will force deploy the persona improvements

const fs = require('fs');
const { exec } = require('child_process');

console.log('🚀 Deploying persona improvements to 3rbst.com...');

// Create a direct deployment command
const deployCommand = `
cd "/Users/samhizam/Downloads/Whatsapp Bot Kopie" && 
rm -rf .vercel && 
echo '{"orgId":"team_RpToFW9t7ZiAHEXlPXH24tB8","projectId":"prj_tG2oTwoj7outyXOLcVPOaLyPYvHr"}' > .vercel/project.json &&
vercel --prod --yes --scope sam-707s-projects
`;

exec(deployCommand, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Deployment failed:', error);
        return;
    }
    
    console.log('✅ Deployment output:', stdout);
    if (stderr) console.log('⚠️ Warnings:', stderr);
    
    console.log('🎉 Deployment completed! Test your WhatsApp bot now.');
});