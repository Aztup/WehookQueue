import { NextFunction, Response, Request } from "express";
import HttpError from '../classes/HttpError';

export default (error: Error, req: Request, res: Response, next: NextFunction) => {

    if (error.name == 'SyntaxError') {
        return res.status(400).json({
            success: false,
            code: 400,
            message: 'Invalid JSON',
            data: error.message
        });
    }
    else if (error instanceof HttpError) {
        let status = error.statusCode || 500;
        let message = error.message;
    
        return res.status(status).json({
            success: false,
            code: status,
            message,
        });
    }

    return res.status(500).json({
        success: false,
        code: 500,
        message: 'Internal Server Error',
    });
};