import express, { Response, Request, Application } from 'express'; // Import express framework
import { Server } from 'http';
import path from 'path';
import cors from 'cors';
// import { toUpperCase as sharedFunction } from '@jonitoh-ts-monorepo/shared';

type SharedParams = {
  text: string;
};
// thx https://github.com/kentcdodds/express-app-example
function setupCloseOnExit(server: Server): void {
  // thank you stack overflow
  // https://stackoverflow.com/a/14032965/971592
  function exitHandler(options: { exit?: boolean } = {}): void {
    try {
      server.close();
      console.info('Server successfully closed');
    } catch (e: unknown) {
      console.warn(
        `Something went wrong closing the server${
          e instanceof Error && e.stack ? `: ${e.stack}` : ''
        }`
      );
    }
    // eslint-disable-next-line no-process-exit
    if (options.exit) process.exit();
  }

  // do something when app is closing
  process.on('exit', exitHandler);

  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}

export async function startServer(
  port: number = parseFloat(process.env.SERVER_PORT || '4000'),
  host: string = process.env.SERVER_HOST || '127.0.0.1'
): Promise<Server> {
  // Initiate express app
  const app: Application = express();

  // CORS
  app.use(cors()); // corsOptions));
  // CORS -- enable pre-flight across-the-board
  // app.options('*', cors(corsOptions));
  // parse requests of content-type - application/json
  app.use(express.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));

  // HELLO WORLD ROUTE
  app.get('/hello-world', (req: Request, res: Response) => {
    res.send({ message: 'YOUR EXPRESS BACKEND IS ALIVE' });
  });

  // HELLO WORLD ROUTE
  function s(t: string) {
    return t;
  }
  app.get('/shared/:text', (req: Request<SharedParams>, res: Response) => {
    const { text } = req.params;
    const result = s(text); // sharedFunction(text);
    res.send({ result });
  });

  // for development and avoid CORS stuff, Express will serve the built frontend
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    const monorepoMode = process.env.MONOREPO && process.env.MONOREPO === 'true';
    console.info(`monorepo Mode activated? ${monorepoMode ? 'YES' : 'NO'}`);
    app.use(express.static(path.join(__dirname, '../dist/client')));
    app.use(express.static(path.join(__dirname, '../dist/client/assets')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../dist/client/index.html'));
    });
  }

  return new Promise((resolve) => {
    const server: Server = app.listen(port, host, () => {
      const usedServer = server?.address();
      if (usedServer && typeof usedServer !== 'string') {
        console.info(`Listening on port ${usedServer.port || 'unknown'}`);
        console.info(`Listening on host ${usedServer.address || 'unknown'}`);
        if (usedServer.port && usedServer.address) {
          console.info(`Listening on http://${usedServer.address}:${usedServer.port}`);
        }
      }
      const originalClose = server.close.bind(server);

      function closeServer(callback?: ((err?: Error | undefined) => void) | undefined) {
        return originalClose(callback);
      }
      server.close = closeServer;
      setupCloseOnExit(server);
      resolve(server);
    });
  });
}

export default { startServer };