import express from "express";
import passport from "passport";
import OpenIDConnectStrategy, { type Profile, type VerifyCallback } from "passport-openidconnect";

const userRouter = express.Router();
console.log({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  hasSecret: !!process.env.AUTH0_CLIENT_SECRET,
  backendUrl: process.env.BACKEND_URL,
})
passport.use(
  new OpenIDConnectStrategy(
    {
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      authorizationURL: `https://${process.env.AUTH0_DOMAIN}/authorize`,
      tokenURL: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      userInfoURL: `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      clientID: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/oauth2/redirect`,
      scope: ["openid","profile", "email"],
    },
    function verify(issuer: string, profile: Profile, cb: VerifyCallback) {
      return cb(null, profile);
    }
  )
);

userRouter.get(
  "/login",
  passport.authenticate("openidconnect")
);

userRouter.get(
  "/oauth2/redirect",
  passport.authenticate("openidconnect", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL ?? "http://localhost:5173");
  }
);

userRouter.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(process.env.FRONTEND_URL ?? "http://localhost:5173");
  });
});

userRouter.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ msg: "not logged in" });
  }
  res.json({ user: req.user });
});

export default userRouter;