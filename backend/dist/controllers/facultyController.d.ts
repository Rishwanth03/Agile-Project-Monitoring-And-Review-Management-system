import { Request, Response } from "express";
export declare const getFacultyDashboard: (req: Request, res: Response) => Promise<void>;
export declare const getSubmissions: (req: Request, res: Response) => Promise<void>;
export declare const reviewSubmission: (req: Request, res: Response) => Promise<void>;
export declare const createTeam: (req: Request, res: Response) => Promise<void>;
export declare const assignStudent: (req: Request, res: Response) => Promise<void>;
export declare const createSprint: (req: Request, res: Response) => Promise<void>;
export declare const getTeams: (req: Request, res: Response) => Promise<void>;
export declare const getStudents: (_req: Request, res: Response) => Promise<void>;
