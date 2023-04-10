import express from "express";
// import fs from 'fs'
import { Router } from "express";
import { Request, Response } from "express";
import formidable from "formidable";
import { mkdirSync } from "fs";
// import { unlink } from 'fs/promises'
import { join } from "path";
import { client } from "../db";
import { checkString, checkBoolean } from "../express";
// import { HttpError } from '../express'
import { getSessionUser } from "../guards";
// import { hasLogin } from '../guards'
let uploadDir = join("uploads", "event-images");
mkdirSync(uploadDir, { recursive: true });
import "../session";
// import { log } from 'console'
// import { extractTag } from "../tagRelatedFunction";
// 引用拆解hashtag的function。

export const eventRoutes = Router();

export type Event = {
  id: number;
  host_id: number;
  eventPicture?: string;
  title: string;
  category: string;
  Date: Date;
  Time: TimeRanges;
  Details: String;
  Hashtag: String;
  Cost: Number;
  Location: String;
  Participants: Number;
  faq: String;
  Is_age18: Boolean;
  Is_private: Boolean;
};

// const uploadDir = "uploads/event-images";
// fs.mkdirSync(uploadDir, { recursive: true });

//Photo Uploads
const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 1024 ** 2 * 200, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

// //加入拆解hashtags的結構，不留空白與符號。
// let insert_post = async (content: string) => {
//   const result = await client.query(
//     /* sql */ `
//     insert into post (content) values ($1) returning id
//   `,
//     [content]
//   );
//   console.log(result.rows[0].id);
//   return result.rows[0].id;
// };
// console.log(insert_post);

// let select_tag_id = async (hashtag: string) => {
//   const result = await client.query(
//     /* sql */ `
// SELECT
//   id
// FROM tag
// WHERE hashtag = $1;
//   `,
//     [hashtag]
//   );
//   return result.rows[0]?.id;
// };

// let insert_tag = async (hashtag: string) => {
//   const result = await client.query(
//     /* sql */ `
//     INSERT INTO tag (hashtag) VALUES ($1) RETURNING id
//   `,
//     [hashtag]
//   );
//   return result.rows[0].id;
// };

// let insert_post_tag = async (post_id: number, tag_id: number) => {
//   await client.query(
//     /* sql */ `
//     INSERT INTO post_tag (post_id, tag_id) VALUES ($1, $2)
//   `,
//     [post_id, tag_id]
//   );
// };

//formidable，有上傳，有兩個cases，一個就object，多於一個就array，沒有就null。
// When #contact-form submit, this route will receive the request
//User Create Event
eventRoutes.post("/createEvent", function (req: Request, res: Response) {
  form.parse(req, async (err, fields, files) => {
    try {
      let host_id = getSessionUser(req).id;
      let eventPictureMaybeArray = files.eventPictures;
      console.log("eventPictureMaybeArray:", files);
      let eventPicture = Array.isArray(eventPictureMaybeArray)
        ? eventPictureMaybeArray[0]
        : eventPictureMaybeArray
          ? eventPictureMaybeArray.newFilename
          : "";
      let title = checkString("title", fields.title);
      let category = checkString("category", fields.category);
      let start_date = checkString("start_date", fields.start_date);
      let end_date = checkString("end_date", fields.end_date);
      let hashtag = checkString("hashtag", fields.hashtag);
      let cost = Number(checkString("cost", fields.cost));
      let location = checkString("location", fields.location);
      let participants = Number(
        checkString("participants", fields.participants)
      );
      let faq = checkString("faq", fields.faq);
      let is_age18 = checkBoolean("is_age18", fields.is_age18);
      let is_private = checkBoolean("is_private", fields.is_private);

      let result = await client.query(
        /* sql */ `
      select
        event.id
      from event
      inner join users on users.id = event.host_id
          `,
        []
      );

      //冇req.body，因此res.body.title無效。已let名為「title」的 variable，因此直接食title已可。
      //加入拆解hashtag。
      // let decodeTag = extractTag(hashtag);
      // //加入把decodeTag資料放入tag table
      // let tags = decodeTag;
      // let { id: post_id } = await insert_post(title);

      // for (let tag of tags) {
      //   let tag_id = await select_tag_id(tag);
      //   if (!tag_id) {
      //     tag_id = (await insert_tag(tag)).lastInsertRowid;
      //   }
      //   await insert_post_tag(post_id, tag_id);
      // }

      // 加入decodeTag及$14
      result = await client.query(
        /* sql */ `
      insert into event
      (host_id, eventPicture, title, category, hashtag, start_date, end_date, cost, location, participants, faq, is_age18, is_private)
      values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      returning id
          `,
        [
          host_id,
          eventPicture,
          title,
          category,
          hashtag,
          start_date,
          end_date,
          cost,
          location,
          participants,
          faq,
          is_age18,
          is_private,
        ]
      );

      let id = result.rows[0].id;
      console.log(id);

      // 成功create event後換頁
      // res.redirect("/view-event.html");

      res.json(id);
    } catch (error) {
      console.log(error);
      res.json({});
    }
  });
});

// //按hashtag的被註冊次數多少來排序
// let select_hashtags = async () => {
//   const result = await client.query(/* sql */ `
//     SELECT
//       tag.id,
//       tag.hashtag,
//       COUNT(post_tag.post_id) AS count
//     FROM tag
//     INNER JOIN post_tag ON post_tag.tag_id = tag.id
//     GROUP BY tag.id
//     ORDER BY count DESC
//   `);
//   return result.rows;
// };

//輸入部份字母便預示完整的hashtags
eventRoutes.get("/tags", async (req, res, next) => {
  try {
    let hashtags = await select_hashtags();
    res.json({ hashtags });
  } catch (error) {
    next(error);
  }
});

//User Edit Event
eventRoutes.post("/editEvent", function (req: Request, res: Response) {
  form.parse(req, async (err, fields, files) => {
    try {
      let eventPictureMaybeArray = files.eventPictures;
      console.log("eventPictureMaybeArray:", files);
      let eventPicture = Array.isArray(eventPictureMaybeArray)
        ? eventPictureMaybeArray[0]
        : eventPictureMaybeArray
          ? eventPictureMaybeArray.newFilename
          : "";
      let id = req.params.id;
      let event_id = req.query.eventId;
      let title = checkString("title", fields.title);
      let category = checkString("category", fields.category);
      let start_date = checkString("start_date", fields.start_date);
      let end_date = checkString("end_date", fields.end_date);
      let hashtag = checkString("hashtag", fields.hashtag);
      let cost = Number(checkString("cost", fields.cost));
      let location = checkString("location", fields.location);
      let participants = Number(
        checkString("participants", fields.participants)
      );
      console.log({ participants });
      let faq = checkString("faq", fields.faq);
      let is_age18 = checkBoolean("is_age18", fields.is_age18);
      let is_private = checkBoolean("is_private", fields.is_private);
      let result = await client.query(
        /* sql */ `
      select
        event.id
      from event
      WHERE event.id = $1
          `,
        [id]
      );

      // let decodeTag = extractTag(hashtag);
      // //加入把decodeTag資料放入tag table
      // let tags = decodeTag;
      // let { id: post_id } = await insert_post(title);

      // for (let tag of tags) {
      //   let tag_id = await select_tag_id(tag);
      //   if (!tag_id) {
      //     tag_id = (await insert_tag(tag)).lastInsertRowid;
      //   }
      //   await insert_post_tag(post_id, tag_id);
      // }

      result = await client.query(
        /* sql */ `
        update event set 
      eventpicture = $1,
      title = $2,  
      category = $3,  
      hashtag = $4,  
      start_date = $5,  
      end_date = $6,  
      cost = $7,  
      location = $8,  
      participants = $9,  
      faq = $10, 
      is_age18 = $11,  
      is_private = $12 
      WHERE id = $13
      returning id
          `,
        [
          eventPicture,
          title,
          category,
          hashtag,
          start_date,
          end_date,
          cost,
          location,
          participants,
          faq,
          is_age18,
          is_private,
          event_id,
        ]
      );
      res.json(result.rows[0].id);
    } catch (error) {
      console.log(error);
      res.json({});
    }
  });
});

//按hashtag的被註冊次數多少來排序
let select_hashtags = async () => {
  const result = await client.query(/* sql */ `
    SELECT
      tag.id,
      tag.hashtag,
      COUNT(post_tag.post_id) AS count
    FROM tag
    INNER JOIN post_tag ON post_tag.tag_id = tag.id
    GROUP BY tag.id
    ORDER BY count DESC
  `);
  return result.rows;
};

//輸入部份字母便預示完整的hashtags
eventRoutes.get("/tags", async (req, res, next) => {
  try {
    let hashtags = await select_hashtags();
    res.json({ hashtags });
  } catch (error) {
    next(error);
  }
});

//Participants press the join button to join the event
eventRoutes.post("/joinEvent", async (req: Request, res: Response) => {
  try {
    let user_id = getSessionUser(req).id;
    let event_id = req.query.eventId;
    let result = await client.query(
      /* sql */ `
      select
      event_participant.id, event_participant.event_id
      from event_participant
      inner join users on users.id = event_participant.user_id
      inner join event on event.id = event_participant.event_id
          `,
      []
    );
    result = await client.query(
      /* sql */ `
      insert into event_participant
      (user_id, event_id)
      values
      ($1, $2)
      returning id
          `,
      [user_id, event_id]
    );

    let id = result.rows[0].id;
    if (user_id == undefined) {
      console.log("Please Login");
    }

    res.json(id);
  } catch (error) {
    console.log(error);
    res.json({});
  }
});

//User upload photos when creating events
eventRoutes.use("/uploads/event-images", express.static(uploadDir));

//Show Event's all details
eventRoutes.get("/viewEvent/:id", async (req, res, next) => {
  // let id=req.query.id
  let id = req.params.id;
  try {
    let result = await client.query(
      /* sql */ `
    select * from event 
    left join event_participant on event_participant.event_id  = event.id
    WHERE event.id = $1
      `,
      [id]
    );

    res.json({ data: result.rows[0], joined: result.rowCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//Show all participants name in single event page
eventRoutes.get("/allParticipants/:id", async (req, res, next) => {
  let id = req.params.id;
  try {
    let result = await client.query(
      /* sql */ `
    select * from users
    right join event_participant on users.id  = event_participant.user_id 
    WHERE event_participant.event_id = $1 and event_participant.active = true
      `,
      [id]
    );
    let users = result.rows;

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

//show user you have joined event or haven't joined event.
eventRoutes.get("/joinStatus/:id", async (req, res, next) => {
  let id = req.params.id;
  try {
    let user_id = getSessionUser(req).id;
    let result = await client.query(
      /* sql */ ` 
    select * from event_participant 
    left join users on users.id  = event_participant.user_id  
    WHERE event_participant.event_id = $1 
    AND event_participant.user_id = $2 
      `,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      res.json({ hasJoin: false });
      console.log("You haven't joined this event.");
    } else {
      res.json({ hasJoin: true });
      console.log("You have joined this event.");
    }
  } catch (error) {
    res.json({ err: error });
    next(error);
  }
});

//show organizer panel.
eventRoutes.get("/organizerPanel/:id", async (req, res, next) => {
  let id = req.params.id;
  try {
    let user_id = getSessionUser(req).id;
    let result = await client.query(
      /* sql */ ` 
    select * from event 
    WHERE id = $1 
    AND host_id = $2 
      `,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      res.json({ organizer: false });
      console.log("You aren't this event organizer.");
    } else {
      res.json({ organizer: true });
      console.log("You are this event organizer.");
    }
  } catch (error) {
    res.json({ err: error });
    next(error);
  }
});

//show all event in index page
eventRoutes.get("/allEvent/", async (req, res, next) => {
  try {
    let result = await client.query(
      /* sql */ `
      select id, eventPicture, category, title, end_date, is_age18, is_private, active from event  
      WHERE event.active = true and event.is_private = false and event.end_date >= NOW() 
        ORDER BY start_date 
      `,
      []
    );
    let events = result.rows;
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

//加入event search功能
export let searchRoutes = Router();

searchRoutes.get("/searchEvent", async (req, res) => {
  try {
    let searchEvent = req.body.search;
    let result = await client.query(
      /* sql */
      `SELECT id 
    FROM event
    WHERE title, hashtag = $1`,
      [`%${searchEvent}%`]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error searching records");
  }
});

//organizer delete event

eventRoutes.delete(
  "/events/:event_id/participants/:user_id",
  async (req: Request, res: Response) => {
    try {
      let user_id = getSessionUser(req).id;
      let event_id = req.params.event_id;
      let result = await client.query(
        /* sql */ `select   host_id
      from event
      WHERE event.id = $1`, [event_id]
      );
      let event = result.rows[0];
      if (!event) {
        res.status(404);
        res.json({ error: "event not found" });
        return;
      }
      if (event.host_id != user_id) {
        res.status(403);
        res.json({ error: "only event host can delete participant" });
        return;
      }
      result = await client.query(
        /* sql */ `  WHERE event_id = $1
        and user_id = $2`, [event_id, req.params.user_id]
      );
      res.json({});
    } catch (error) {
      res.status(500);
      res.json({ error: String(error) });
    }
  });

//organizer delete participant
eventRoutes.delete(
  "/events/:event_id/participants/:user_id",
  async (req: Request, res: Response) => {
    try {
      let user_id = getSessionUser(req).id;
      let event_id = req.params.event_id;
      let result = await client.query(
        /* sql */ `
      select
        host_id
      from event
      WHERE event.id = $1
        `,
        [event_id]
      );
      let event = result.rows[0];
      if (!event) {
        res.status(404);
        res.json({ error: "event not found" });
        return;
      }
      if (event.host_id != user_id) {
        res.status(403);
        res.json({ error: "only event host can delete participant" });
        return;
      }
      result = await client.query(
        /* sql */ `
      update event_participant set active = false 
      WHERE event_id = $1
        and user_id = $2
        `,
        [event_id, req.params.user_id]
      );
      res.json({});
    } catch (error) {
      res.status(500);
      res.json({ error: String(error) });
    }
  }
);

eventRoutes.get("/allCreateEvent", async (req, res, next) => {
  try {
    let user_id = getSessionUser(req).id;
    let result = await client.query(
      /* sql */ `
    select id, host_id, eventPicture, title, end_date, active from event 
    WHERE event.active = true and event.end_date >= NOW() and event.host_id = ${user_id}
    ORDER BY start_date
        `,
      []
    );
    let events = result.rows;
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

eventRoutes.get("/allJoinedEvent", async (req, res, next) => {
  try {
    let user_id = getSessionUser(req).id;

    let result = await client.query(
      /* sql */ `
    select event.id,
        event.eventPicture,
        event.title,
        event.end_date,
        event.active 
    from event_participant 
    inner join event on event_participant.event_id = event.id
    WHERE event.active = true and event.end_date >= NOW() and event_participant.user_id = ${user_id}
    ORDER BY start_date
        `,
      []
    );
    let events = result.rows;
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

// eventRoutes.post("/eventSearch", async (req, res) => {
//   let search = req.body.search;
//   let query = req.body.query;
//   //console.log("search: ", search, "query", query);
//   let searchList = await client.query(
//     `
//     SELECT event.title
// FROM event
// INNER JOIN hashtag ON employee.id = claim.employee_id
// INNER JOIN department ON department.id = claim.department_id
// WHERE ${search} Like $1
// ORDER BY claim.id DESC;`,
//     [`%${query}%`]
//   );
//   //let dbEmployee = dbEmployeeList.rows[0];
//   //console.log(dbEmployee);
//   //console.log("searchList from db searched by query+search", searchList.rows);
//   res.json(searchList.rows);
// });

// eventRoutes.post("/eventSearch", async (req, res) => {
//   let search = req.body.search;
//   let query = req.body.query;
//   //console.log("search: ", search, "query", query);
//   let searchList = await client.query(
//     `
//     SELECT event.title
// FROM event
// INNER JOIN hashtag ON employee.id = claim.employee_id
// INNER JOIN department ON department.id = claim.department_id
// WHERE ${search} Like $1
// ORDER BY claim.id DESC;`,
//     [`%${query}%`]
//   );
//   //let dbEmployee = dbEmployeeList.rows[0];
//   //console.log(dbEmployee);
//   //console.log("searchList from db searched by query+search", searchList.rows);
//   res.json(searchList.rows);
// });
