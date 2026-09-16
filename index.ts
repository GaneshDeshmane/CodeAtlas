import agentRouter from "./routes/agent";
import ingestRouter from "./routes/ingest";
import userRouter from "./routes/user";
import "dotenv/config";
import express from 'express'
const app = express()
import cors from 'cors'
import session from "express-session";
import passport from "passport";
// process.on('unhandledRejection', (reason) => {
//     console.error('REAL ERROR:', reason)
//   })
app.use(express.json())
app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
  });

app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

  
app.use('/agent',agentRouter)
app.use('/ingestion',ingestRouter)
app.use('/', userRouter);

// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     console.error('EXPRESS ERROR HANDLER:', err)
//     console.error('MESSAGE:', err?.message)
//     console.error('OAUTH ERROR:', err?.oauthError)
//     res.status(500).send('Auth error — check server logs')
//   })


app.listen(3001)