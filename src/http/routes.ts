import { NextFunction, Request, Response, Router } from "express";

import * as facebookController from './controllers/facebookController';

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
routes.post("/share/facebook/ranking", facebookController.shareUserRanking);

export default routes;