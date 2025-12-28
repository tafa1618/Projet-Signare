// Script wrapper pour contourner le problème node:sea sur Windows avec Node.js v24
const { spawn } = require('child_process');
const path = require('path');

// Désactiver les externals Node avant de lancer Expo
process.env.EXPO_NO_NODE_EXTERNALS = '1';
process.env.NODE_OPTIONS = '--no-node-snapshot';

// Créer le dossier .expo/metro/externals s'il n'existe pas (sans le node:sea)
const fs = require('fs');
const externalsDir = path.join(__dirname, '.expo', 'metro', 'externals');
if (!fs.existsSync(externalsDir)) {
  fs.mkdirSync(externalsDir, { recursive: true });
}

// Lancer Expo
const expoProcess = spawn('npx', ['expo', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    EXPO_NO_NODE_EXTERNALS: '1',
    NODE_OPTIONS: '--no-node-snapshot'
  }
});

expoProcess.on('error', (error) => {
  console.error('Erreur lors du lancement d\'Expo:', error);
  process.exit(1);
});

expoProcess.on('exit', (code) => {
  process.exit(code);
});

