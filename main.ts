import { isLoggedIn } from "./guards";

app.use("/", userRoutes);
app.use("/resources", isLoggedIn, appleRoutes);

app.use(express.static("public"));
app.use(isLoggedIn, express.static("frontend"));