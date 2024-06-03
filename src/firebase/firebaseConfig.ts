import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyC3cVzdCqEHRfd_cXdrRSQuaFI1yv9DfYk',
  authDomain: 'viso-display-map.firebaseapp.com',
  projectId: 'viso-display-map',
  storageBucket: 'viso-display-map.appspot.com',
  messagingSenderId: '734727085408',
  appId: '1:734727085408:web:f4b05b2153c10fc0c49205',
  measurementId: 'G-BMDNST5PQE',
  databaseURL:
    'https://viso-display-map-default-rtdb.europe-west1.firebasedatabase.app',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

// apiKey: "YOUR_API_KEY",
// authDomain: "YOUR_AUTH_DOMAIN",
// projectId: "YOUR_PROJECT_ID",
// storageBucket: "YOUR_STORAGE_BUCKET",
// messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
// appId: "YOUR_APP_ID",
// databaseURL: "YOUR_DATA_BASE_URL"
