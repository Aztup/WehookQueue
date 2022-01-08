import { NextFunction, Response, Request } from "express";
import HttpError from '../classes/HttpError';

export default (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('Authorization');
    if (!apiKey) return next(new HttpError('No API key found', 401));
    if (apiKey !== process.env.API_KEY) return next(new HttpError('Invalid API key', 401));

    next();
};