const { db } = require('../config/firebase');

async function checkGallery() {
  try {
    const snapshot = await db.ref('gallery').once('value');
    const data = snapshot.val();
    if (!data) {
      console.log('Gallery is empty');
    } else {
      console.log('Gallery Data Found:', Object.keys(data).length, 'items');
      console.log(JSON.stringify(data, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGallery();
