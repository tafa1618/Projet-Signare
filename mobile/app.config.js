require('dotenv').config()

/** @type {import('@expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  name: 'Signare Mobile',
  slug: 'signare-mobile',
  scheme: 'signare',
  userInterfaceStyle: 'dark',
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'signare-mobile-demo',
    },
  },
})

