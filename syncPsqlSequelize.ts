//chatGPT提供的把postgreSQL與sequelize結合的第二個方案。

// 引入 Sequelize 和相關類型
import { Sequelize, Model, DataTypes } from "sequelize";

// 建立一個 Sequelize 實例
const sequelize = new Sequelize(
  "postgres://username:password@localhost:5432/database"
);

// 定義 User 模型
class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public resetPasswordToken!: string | null;
  public resetPasswordExpires!: Date | null;
}

// 定義 User 模型的屬性
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

// 在這裡定義 User 模型的關聯，例如與其他表的關聯

// 將 User 模型導出
export { User };

//chatGPT提供的把postgreSQL與sequelize結合的第一個方案。

// import { User } from "./routes/user.routes";

// const { Sequelize, DataTypes } = require("sequelize");

// const sequelize = new Sequelize("database", "username", "password", {
//   host: "localhost",
//   dialect: "postgres",
// });

// const User = sequelize.define("User", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   password_hash: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   resetPasswordToken: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   resetPasswordExpires: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
// });

// sequelize.sync();
// module.exports = { User };

// const { User: UserModel } = require("./user");

// // 創建一個新用戶
// typeof UserModel.create({
//   name: "John Doe",
//   email: "john@example.com",
//   password: "password",
// })
//   .then((user: typeof UserModel) => {
//     console.log("User created:", user.toJSON());
//   })
//   .catch((error: Error) => {
//     console.error("Error creating user:", error);
//   });

// // 查詢所有用戶
// typeof UserModel.findAll()
//   .then((users: typeof UserModel[]) => {
//     console.log(
//       "All users:",
//       users.map((user) => user.toJSON())
//     );
//   })
//   .catch((error: Error) => {
//     console.error("Error fetching users:", error);
//   });
