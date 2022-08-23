"use strict";

const functions = require("firebase-functions");
const sanitizer = require("./sanitizer");
const admin = require("firebase-admin");

const serviceAccount = require("./videolog-23d84-firebase-adminsdk-n79mr-acb6214e38.json");
const {addVideoLog, removeVideoLog} = require("./services/videologservice");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// [START allAdd]
// [START addFunctionTrigger]
exports.addVideoLog = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
    );
  }
  const userId = context.auth.uid;
  await addVideoLog(userId, data);
});
// [END allAdd]

exports.removeVideoLog = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
    );
  }
  const userId = context.auth.uid;
  await removeVideoLog(userId, data.recordId);
});

// [START messageFunctionTrigger]
// but sanitizes the text by removing swearwords.
exports.addVipUser = functions.https.onCall((data, context) => {
  // [START_EXCLUDE]
  // [START readMessageData]
  // Message text passed from the client.
  const text = data.text;
  // [END readMessageData]
  // [START messageHttpsErrors]
  // Checking attribute.
  if (!(typeof text === "string") || text.length === 0) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
        "one arguments \"text\" containing the message text to add.",
    );
  }
  // Checking that the user is authenticated.
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
    );
  }
  // [END messageHttpsErrors]

  // [START authIntegration]
  // Authentication / user information is automatically added to the request.
  const uid = context.auth.uid;
  const name = context.auth.token.name || null;
  const picture = context.auth.token.picture || null;
  const email = context.auth.token.email || null;
  // [END authIntegration]

  // [START returnMessageAsync]
  // Saving the new message to the Realtime Database.
  const sanitizedMessage =
      sanitizer.sanitizeText(text); // Sanitize the message.
  return (
    admin
        .database()
        .ref("/messages")
        .push({
          text: sanitizedMessage,
          author: {uid, name, picture, email},
        })
        .then(() => {
          console.log("New Message written");
          // Returning the sanitized message to the client.
          return {text: sanitizedMessage};
        })
    // [END returnMessageAsync]
        .catch((error) => {
          // Re-throwing the error as an HttpsError so that
          // the client gets the error details.
          throw new functions.https.HttpsError("unknown", error.message, error);
        })
  );
  // [END_EXCLUDE]
});
// [END messageFunctionTrigger]
