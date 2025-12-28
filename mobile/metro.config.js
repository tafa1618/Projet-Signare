const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// CETTE LIGNE EST LE REMÈDE : 
// Elle empêche Metro d'essayer de créer des dossiers pour les modules Node natifs
config.resolver.unstable_enablePackageExports = false;

// Désactiver les externals Node pour éviter les problèmes avec les dossiers contenant ":"
process.env.EXPO_NO_NODE_EXTERNALS = '1';

module.exports = config;