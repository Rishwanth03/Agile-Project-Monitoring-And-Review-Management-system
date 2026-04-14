import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department, rollNumber, year, section, phone, designation } = req.body;
    const uppercaseDepartmentRegex = /^[A-Z]+(?: [A-Z]+)*$/;
    const studentRollNumberRegex = /^RA\d{13}$/;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "Name, email, password, and role are required" });
      return;
    }

    if (!["student", "faculty"].includes(role)) {
      res.status(400).json({ error: "Role must be student or faculty" });
      return;
    }

    if (role === "student") {
      if (!department || !uppercaseDepartmentRegex.test(String(department).trim())) {
        res.status(400).json({
          error: "For student registration, department must contain uppercase letters only",
        });
        return;
      }

      if (!rollNumber || !studentRollNumberRegex.test(String(rollNumber).trim())) {
        res.status(400).json({
          error: "Roll number must start with RA and be exactly 15 characters (RA + 13 digits)",
        });
        return;
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        department,
        ...(role === "student"
          ? {
              studentProfile: {
                create: {
                  rollNumber: rollNumber ? String(rollNumber).trim() : null,
                  year: year !== undefined && year !== null ? String(year) : null,
                  section,
                  phone,
                },
              },
            }
          : {
              facultyProfile: {
                create: { designation, department },
              },
            }),
      },
      include: {
        studentProfile: role === "student",
        facultyProfile: role === "faculty",
      },
    });

    const secret = process.env.JWT_SECRET || "default-secret";
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const secret = process.env.JWT_SECRET || "default-secret";
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
