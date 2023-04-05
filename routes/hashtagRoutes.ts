import { Router } from "express";
import { client } from "../db";
import { extractTag } from "../tagRelatedFunction";

export let hashtagRoutes = Router();

//type Text = {
//  oid: number;
//  length: number;
// alignment: number;
//  parse: (value: string) => any;
//  to: (value: any) => string;
//};

//放棄用import client from pg及type Text的方案，把content的type改成string，因typescrtpt沒有text。
let insert_post = async (content: string) => {
  const result = await client.query(
    /* sql */ `
    insert into post (content) values ($1) returning id
  `,
    [content]
  );
  console.log(result.rows[0].id);
  return result.rows[0].id;
};
console.log(insert_post);

let select_tag_id = async (hashtag: string) => {
  const result = await client.query(
    /* sql */ `
SELECT
  id
FROM tag
WHERE hashtag = $1;
  `,
    [hashtag]
  );
  return result.rows[0]?.id;
};

let insert_tag = async (hashtag: string) => {
  const result = await client.query(
    /* sql */ `
    INSERT INTO tag (hashtag) VALUES ($1) RETURNING id
  `,
    [hashtag]
  );
  return result.rows[0].id;
};

let insert_post_tag = async (post_id: number, tag_id: number) => {
  await client.query(
    /* sql */ `
    INSERT INTO post_tag (post_id, tag_id) VALUES ($1, $2)
  `,
    [post_id, tag_id]
  );
};

hashtagRoutes.post("/post", async (req, res, next) => {
  try {
    console.log(req.body);
    let tags = extractTag(req.body.hashtags);
    let result = await insert_post(req.body.content);
    let post_id = result.lastInsertRowid;

    for (let tag of tags) {
      let tag_id = await select_tag_id(tag);
      if (!tag_id) {
        tag_id = (await insert_tag(tag)).lastInsertRowid;
      }
      await insert_post_tag(post_id, tag_id);
    }

    //以下code會顯示空的{}，因result.lastInsertRowid沒有數值。
    // res.json({ post_id });

    res.redirect("/index.html");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

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

hashtagRoutes.get("/tags", async (req, res, next) => {
  try {
    let hashtags = await select_hashtags();
    res.json({ hashtags });
  } catch (error) {
    next(error);
  }
});
