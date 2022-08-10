"use strict";

const admin = require("firebase-admin");
const {VIDEO_LOGS, VIDEOS, USAGE, BUCKET} = require("../constants");
const functions = require("firebase-functions");
const {getStorage} = require("firebase-admin/storage");


module.exports.addVideoLog = async function(uid, videoLog) {
  await admin.firestore().collection(VIDEO_LOGS).doc(uid).update(
      {
        logs: [videoLog],
      },
  );
};

module.exports.readLogSize = async function(uid, fileName) {
  const file = admin.storage().bucket(BUCKET)
      .file(VIDEOS + "/" + uid + "/" + fileName);
  const exists = await file.exists();
  if (exists) {
    const meta = await file.getMetadata();
    return parseInt(meta[0].size);
  } else {
    throw new functions.https.HttpsError(
        "unknown",
        "$file for user $uid dose not exist",
    );
  }
};

module.exports.removeLogFile = async function(uid, fileName) {
  const file = admin.storage().bucket(BUCKET)
      .file(VIDEOS + "/" + uid + "/" + fileName);
  const exists = await file.exists();
  if (exists) {
    await file.delete();
  } else {
    throw new functions.https.HttpsError(
        "unknown",
        "$file for user $uid dose not exist",
    );
  }
};

module.exports.getUsagePlan = async function(uid) {
  const usageRef = admin.firestore().collection(USAGE).doc(uid);
  const doc = await usageRef.get();
  if (!doc.exists) {
    throw new functions.https.HttpsError(
        "unknown",
        "usage plan does not exist for user $uid",
    );
  } else {
    return doc.data();
  }
};

module.exports.updateUsage = async function(uid, usage) {
  await admin.firestore().collection(USAGE).doc(uid).update(
      {
        usage: admin.firestore.FieldValue.increment(usage),
      },
  );
};
