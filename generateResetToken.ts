//第二個chatgpt版本

import { User } from "./syncPsqlSequelize";
import * as crypto from "crypto";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "postgres://postgres:postgres@localhost:5432/eventplatform"
);

export async function generateResetToken(username: string) {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    // 如果未找到用戶，則返回一個錯誤或者選擇一個默認值
    throw new Error("未找到用戶");
  }

  // Date now - will use it for expiration
  const now = new Date();

  // Convert to Base64
  const timeBase64 = Buffer.from(now.toISOString()).toString("base64");

  // Convert to Base64 user username - will use for retrieve user
  const usernameBase64 = Buffer.from(user.username).toString("base64");

  // User info string - will use it for sign and use token once
  const userString = `${user.username}${user.email}${user.password_hash}${user.updatedAt}`;
  const userStringHash = crypto
    .createHash("md5")
    .update(userString)
    .digest("hex");

  // Generate a formatted string [time]-[userSign]-[username]
  const tokenize = `${timeBase64}-${userStringHash}-${usernameBase64}`;

  // encrypt token
  return encryptToken(tokenize);
}

// Encrypt token with password using crypto.Cipheriv
function encryptToken(stringToEncrypt: string) {
  const key = crypto.createHash("sha256").update("popcorn").digest();

  const IV_LENGTH = 16;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = cipher.update(stringToEncrypt);

  const result = Buffer.concat([encrypted, cipher.final()]);

  // formatted string [iv]:[token]
  return iv.toString("hex") + ":" + result.toString("hex");
}

// 建立一個資料庫連接，並檢查連接是否成功
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

//第一個chatgpt版本
// import { User } from "./syncPsqlSequelize";
// import { Sequelize } from "sequelize";
// import * as crypto from "crypto";

// export function generateResetToken(user: User) {
//   // Date now - will use it for expiration
//   const now = new Date();

//   // Convert to Base64
//   const timeBase64 = Buffer.from(now.toISOString()).toString("base64");

//   // Convert to Base64 user username - will use for retrieve user
//   const usernameBase64 = Buffer.from(user.username).toString("base64");

//   // User info string - will use it for sign and use token once
//   const userString = `${user.username}${user.email}${user.password_hash}${user.updatedAt}`;
//   const userStringHash = crypto
//     .createHash("md5")
//     .update(userString)
//     .digest("hex");

//   // Generate a formatted string [time]-[userSign]-[username]
//   const tokenize = `${timeBase64}-${userStringHash}-${usernameBase64}`;

//   // encrypt token
//   return encryptToken(tokenize);
// }

// // Encrypt token with password using crypto.Cipheriv
// function encryptToken(stringToEncrypt: string) {
//   const key = crypto.createHash("sha256").update("popcorn").digest();

//   const IV_LENGTH = 16;
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//   const encrypted = cipher.update(stringToEncrypt);

//   const result = Buffer.concat([encrypted, cipher.final()]);

//   // formatted string [iv]:[token]
//   return iv.toString("hex") + ":" + result.toString("hex");
// }

// const sequelize = new Sequelize(
//   "postgres://postgres:postgres@localhost:5432/eventplatform"
// );

// // 建立一個資料庫連接，並檢查連接是否成功
// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// }

// testConnection();
// // 這樣，你就可以使用 sequelize 變數來建立一個資料庫連接，並在控制台輸出連接成功或失敗的訊息。如果你希望在 generateResetToken.ts 中使用 sequelize 變數，你可以將上述程式碼中的 testConnection() 函數替換為你需要的程式碼。
