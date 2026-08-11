/*
  Eric's Expense Equalizer — Firebase configuration

  Firebase is enabled in this build.

  This is the normal Firebase WEB configuration object. It is intended to be
  present in client-side web apps. Security is enforced by Firebase Auth +
  Firestore Security Rules.

  Do not put service-account private keys in this file.
*/
window.EEE_FIREBASE = {
  enabled: true,

  config: {
    apiKey: "AIzaSyD1HTfST2EEeZJ3_NWg42JGn_zxHt4lcDU",
    authDomain: "expense-equalizer.firebaseapp.com",
    projectId: "expense-equalizer",
    storageBucket: "expense-equalizer.firebasestorage.app",
    messagingSenderId: "881253058521",
    appId: "1:881253058521:web:fe4973134c1e58bbae3bc8"
  }
};
