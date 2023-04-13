import { Router } from "express";
import { client } from "../db";
import { getString, getPhone, HttpError } from "../express";
import { comparePassword, hashPassword } from "../hash";
import "../session";
import { getSessionUser } from "../guards";
import nodemailer from "nodemailer";
import { env } from "../env";
// import { EmailService } from "../emailService";

//.
// transport.sendMail({...})

// let emailServer = new EmailService()
// emailServer.sendEmail({...})

export let userRoutes = Router();

export type User = {
  id: number;
  username: string;
  showedName: string;
  avatar?: string;
  rating: number;
  bio: string;
  email: string;
  phone: string;
  password: string;
  is_age18: boolean;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
};

userRoutes.get("/users", async (req, res, next) => {
  try {
    let result = await client.query(/* sql */ `
select
  id
, username
from users
`);
    let users = result.rows;
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// //註冊功能測試
// userRoutes.post('/signUp', (req, res) => {
//   console.log(req.body);
//   res.json({
//     user: 1,
//   })
// })

userRoutes.post("/signUp", async (req, res, next) => {
  try {
    let username = getString(req, "username");
    let showedName = getString(req, "showedName");
    let password = getString(req, "password");

    //check password?=confirmPassword
    let confirmPassword = getString(req, "confirmPassword");

    let email = getString(req, "Email");
    let phone = getPhone(req, "phone");
    let password_hash = await hashPassword(password);
    //加上 >= 18，以判定是否18歲或以上。
    let is_age18 = req.body.age >= 18;

    //check password?=confirmPassword
    if (password !== confirmPassword) {
      throw new HttpError(409, "Password not match");
    }

    // //此句用於檢測bug在什麼地方，不用。
    // console.log({is_age18})

    //以下code的運作原理，是按照table users的username column檢出id，這裏只是檢查出一個空白的array。然後進入if(user){}的條件判斷，由於是空白，自然可以進入「否」的next step，若然「是」便throw error。
    let result = await client.query(
      /* sql */ `
select
  id
from users
where username = $1
    `,
      [username]
    );
    let user = result.rows[0];

    // console.log('post signup query result rows:',result.rows)
    // console.log('post signup query result rows[0]:',result.rows[0])

    if (user) {
      throw new HttpError(409, "this username is already in use");
    }

    const newUser = await client.query(
      /* sql */ `
insert into users
(username, showedName, password_hash, email, phone, is_age18)
values
($1, $2, $3, $4, $5, $6)
returning id
    `,
      [username, showedName, password_hash, email, phone, is_age18]
    );

    req.session.user = {
      id: newUser.rows[0].id,
      name: username,
      avatar: null,
    };
    console.log(newUser);

    req.session.save();

    // let id = result.rows[0].id

    // res.json({
    //   id,
    // })

    res.redirect("/index.html");
  } catch (error: any) {
    //?error=${error.message}是插入一個query，for front end 用，{error.message}會顯示出現error時的那一行error message。
    res.redirect(`/sign-up.html?error=${error.message}`);

    // next(error);
  }
});

userRoutes.post("/login", async (req, res, next) => {
  try {
    let username = getString(req, "username");
    let password = getString(req, "password");

    let result = await client.query(
      /* sql */ `
select
  id
, password_hash
from users
where username = $1
    `,
      [username]
    );
    let user = result.rows[0];

    if (!user) {
      throw new HttpError(403, "wrong username");
    }

    // if (user.password !== password) {
    //   throw new HttpError(403, 'wrong username or password')
    if (
      !(await comparePassword({ password, password_hash: user.password_hash }))
    ) {
      throw new HttpError(403, "wrong username or password");
    }

    req.session.user = {
      id: user.id,
      name: username,
      avatar: null,
    };
    console.log(req.session.user);

    req.session.save();

    // 不能兩個res，會矛盾。
    // res.json({ id: user.id })

    res.redirect("/index.html");
  } catch (error) {
    next(error);
  }
});

userRoutes.post("/logout", (req, res) => {
  if (!req.session.user) {
    res.json({ role: "guest" });
    return;
  }
  req.session.destroy((err) => {
    if (err) {
      res.json({ role: "user" });
    } else {
      res.json({ role: "guest" });
    }
  });
});

userRoutes.get("/role", (req, res) => {
  res.json({
    user: req.session.user,
  });
  //新加以下來判斷是否登入，但爆error
  // res.json({
  //   role: req.session.user ? 'admin' : 'guest',
  //   username: req.session.user?.username,
  // })
});

userRoutes.get("/non18users", async (req, res, next) => {
  try {
    let user_id = getSessionUser(req).id;
    let result = await client.query(
      /* sql */ `
      select id, is_age18 from users
      WHERE id = $1 
      `,
      [user_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

let transport = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

//Why MINUTE is  60 * 1000?
const MINUTE = 60 * 1000;

userRoutes.post("/reset-pw-request", async (req, res) => {
  let { email } = req.body;
  if (!email) {
    res.status(400);
    res.json({ error: "missing email" });
    return;
  }
  let code = Math.random().toString(36).slice(2, 8).toUpperCase();
  console.log(code);
  let expire = new Date(Date.now() + 15 * MINUTE);
  try {
    let result = await client.query(
      /*sql*/ `
      select id from users
      where email = $1    
    `,
      [email]
    );
    let user = result.rows[0];
    if (!user) {
      res.status(404);
      res.json({ error: "this email is not registered" });
      return;
    }
    //when to use 'set' or 'update'?

    await client.query(
      /*sql*/ `
update users
set token = $1,
    token_expire_at = $2,
    token_attempt = 0
where id = $3
    
`,
      [code, expire, user.id]
    );
  } catch (error) {
    res.status(500);
    res.json({ error: "Database error:" + error });
    return;
  }

  let text = `We received your request to reset password, please enter this verification code: "${code}" (without the quotation). If you have not requesred to reset password, it is safe to ignore this email.`;
  let html = /*sql*/ `
<p>We received your request to reset password, please enter this verification coed below</p>
<b>${code}</b>
<p>If you have not requesred to reset password, it is safe to ignore this email.</p>
  `;
  try {
    if (env.EMAIL_USER === "skip") {
      throw new Error("skipped email");
    }
    await transport.sendMail({
      from: env.EMAIL_USER,
      to: email,
      subject: "Reset Password of Pecky account.",
      text,
      html,
    });
  } catch (error) {
    console.log(error);
    console.log("email content:", text);

    //have to use these again when the email system is normal. Also, have to change env
    // res.status(500);
    // res.json({ error: "Failed to send email:" + error });
    // return;
  }
  res.json({
    message:
      "Email sent. Please check your inbox and also spam folder just in case.",
  });
});

userRoutes.post("/claim-reset-pw", async (req, res) => {
  let { email, code, new_password } = req.body;
  if (!email) {
    res.status(400);
    res.json({ error: "missing email" });
    return;
  }
  if (!code) {
    res.status(400);
    res.json({ error: "missing code" });
    return;
  }
  if (!new_password) {
    res.status(400);
    res.json({ error: "missing new password" });
    return;
  }
  try {
    let result = await client.query(
      /*sql*/ `
select token_expire_at, token_attempt, id, token
from users
where email=$1
`,
      [email]
    );
    let user = result.rows[0];
    if (!user) {
      res.status(400);
      res.json({ error: "Wrong email" });
      return;
    }
    if (user.token_attempt > 5) {
      res.status(400);
      res.json({
        error:
          "Verification coed is expired. Please request another code in the reset password page.",
      });
    }
    console.log({ token: user.token, code });
    if (user.token !== code) {
      await client.query(
        /*sql*/ `
        update users
        set token_attempt = token_attempt + 1
        where id = $1
`,
        [user.id]
      );
      res.status(400);
      res.json({
        error:
          "Wrong verification code. Please double check the code from your email.",
      });
      return;
    }
    //what is 'new Date'?
    if (new Date(user.token_expire_at).getTime() < Date.now()) {
      res.status(400);
      res.json({
        error:
          "Verfication code is expired. Please request a new verification code.",
      });
      return;
    }

    let password_hash = await hashPassword(new_password);

    await client.query(
      /*sql*/ `
      update users
      set password_hash = $1
      where id = $2
`,
      [password_hash, user.id]
    );
    res.json({ message: "The password is updated." });
  } catch (error) {
    res.status(500);
    res.json({ error: "Database error:" + error });
  }
});
