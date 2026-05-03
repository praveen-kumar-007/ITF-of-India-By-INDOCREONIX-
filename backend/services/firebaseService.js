const { db } = require('../config/firebase');

/**
 * Save data to a Realtime Database reference
 * @param {string} path - Reference path (e.g. 'registrations')
 * @param {Object} data - Data to save
 * @returns {Promise<string>} - The key of the created record
 */
const saveData = async (path, data) => {
  const newRef = db.ref(path).push();
  await newRef.set({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return newRef.key;
};

/**
 * Get all records from a path
 * @param {string} path - Reference path
 * @returns {Promise<Array>}
 */
const getAllData = async (path) => {
  const snapshot = await db.ref(path).once('value');
  const data = snapshot.val();
  if (!data) return [];
  
  return Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  }));
};

/**
 * Get a single record by ID
 * @param {string} path - Reference path
 * @param {string} id - Record ID
 * @returns {Promise<Object>}
 */
const getDataById = async (path, id) => {
  const snapshot = await db.ref(`${path}/${id}`).once('value');
  const data = snapshot.val();
  if (!data) return null;
  return { id, ...data };
};

/**
 * Delete a record by ID
 * @param {string} path - Reference path
 * @param {string} id - Record ID
 */
const deleteData = async (path, id) => {
  await db.ref(`${path}/${id}`).remove();
};

/**
 * Query data by field (Equivalent to Firestore where)
 * Added for OTP lookup
 */
const queryData = async (path, field, value) => {
  const snapshot = await db.ref(path).orderByChild(field).equalTo(value).once('value');
  const data = snapshot.val();
  if (!data) return [];
  
  return Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  }));
};

/**
 * Update a record by ID
 * @param {string} path - Reference path
 * @param {string} id - Record ID
 * @param {Object} data - Data to update
 */
const updateData = async (path, id, data) => {
  await db.ref(`${path}/${id}`).update({
    ...data,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Check Firebase connection health
 * @returns {Promise<Object>}
 */
const checkFirebaseHealth = async () => {
  try {
    const snapshot = await db.ref('.info/connected').once('value');
    const isConnected = snapshot.val();
    return { 
      status: isConnected ? 'healthy' : 'unhealthy', 
      message: isConnected ? 'Firebase connected' : 'Firebase disconnected' 
    };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

module.exports = {
  saveData,
  getAllData,
  getDataById,
  deleteData,
  queryData,
  updateData,
  checkFirebaseHealth
};
