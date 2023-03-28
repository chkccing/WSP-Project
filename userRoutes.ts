async function logout(req: express.Request, res: express.Response) {
    if (req.session) {
      delete req.session["user"];
    }
    res.redirect("/login.html");
  }