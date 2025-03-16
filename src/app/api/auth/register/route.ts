import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AccountType } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const accountTypeStr = formData.get("accountType") as string;
    const profileImage = formData.get("profileImage") as File | null;
    
    // Validierung
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "E-Mail, Benutzername und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Überprüfen, ob E-Mail oder Benutzername bereits existieren
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-Mail oder Benutzername wird bereits verwendet" },
        { status: 400 }
      );
    }

    // Konvertieren des accountType-Strings in den AccountType-Enum
    let accountType: AccountType;
    switch (accountTypeStr.toLowerCase()) {
      case "escort":
        accountType = AccountType.ESCORT;
        break;
      case "agency":
        accountType = AccountType.AGENCY;
        break;
      case "club":
        accountType = AccountType.CLUB;
        break;
      case "studio":
        accountType = AccountType.STUDIO;
        break;
      default:
        accountType = AccountType.MEMBER;
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Profilbild speichern, falls vorhanden
    let imagePath = null;
    if (profileImage) {
      const uniqueFilename = `${uuidv4()}-${profileImage.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "profile-images");
      
      // Sicherstellen, dass das Verzeichnis existiert
      await fs.ensureDir(uploadDir);
      
      // Datei speichern
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(filePath, buffer);
      
      // Relativen Pfad für die Datenbank speichern
      imagePath = `/uploads/profile-images/${uniqueFilename}`;
    }

    // Benutzer in der Datenbank erstellen
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        accountType,
        image: imagePath
      }
    });

    // Sensible Daten entfernen
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { 
        message: "Benutzer erfolgreich registriert", 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registrierungsfehler:", error);
    return NextResponse.json(
      { error: "Bei der Registrierung ist ein Fehler aufgetreten" },
      { status: 500 }
    );
  }
}
