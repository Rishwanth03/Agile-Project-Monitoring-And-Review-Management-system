import { Request, Response, NextFunction } from "express";
interface JwtPayload {
    userId: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeRole: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export {};
