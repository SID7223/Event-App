const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\b4461193-4013-40f1-a820-5d07610119ff\\logo_mask_transparent_1783375342452.png';
const dest = path.join(__dirname, 'assets', 'onboarding-icon-mask.png');

try {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied transparent onboarding-icon-mask.png to assets!');
} catch (err) {
  console.error('Error copying mask:', err);
}
