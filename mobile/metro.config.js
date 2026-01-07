const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// CETTE LIGNE EST LE REMÈDE : 
// Elle empêche Metro d'essayer de créer des dossiers pour les modules Node natifs
config.resolver.unstable_enablePackageExports = false;

// S'assurer que Metro peut résoudre les fichiers à la racine du projet
config.resolver.sourceExts = [...config.resolver.sourceExts, 'js', 'jsx', 'ts', 'tsx', 'json'];

// Désactiver les externals Node pour éviter les problèmes avec les dossiers contenant ":"
process.env.EXPO_NO_NODE_EXTERNALS = '1';

module.exports = config;