const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

// Gracefully copy the transparent mask file if source exists locally
try {
  const src = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\b4461193-4013-40f1-a820-5d07610119ff\\logo_mask_transparent_1783375342452.png';
  const dest = path.join(__dirname, 'assets', 'onboarding-icon-mask.png');
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied onboarding-icon-mask.png to assets!');
  }
} catch (err) {
  // Silent fail on CI/EAS where local paths don't exist
}

module.exports = getDefaultConfig(__dirname);
