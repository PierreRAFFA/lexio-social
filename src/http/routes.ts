import { NextFunction, Request, Response, Router } from "express";
import { accessControl } from 'lexio';
import * as shareController from './controllers/shareController';

const routes: Router = require('express').Router();

routes.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server running successfully');
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////// HEALTHCHECK
routes.get('/healthcheck', (req: Request, res: Response) => {
  res.status(200).send('');
});

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////// EXAMPLE
routes.post("/api/share/facebook/user-ranking", accessControl, shareController.shareUserRanking);
routes.post("/api/share/facebook/ranking", accessControl, shareController.shareRanking);

export default routes;
