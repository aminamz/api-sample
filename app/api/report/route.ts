import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "products.txt");

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(FILE_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

export async function GET() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data || "[]"));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of products." }, { status: 400 });
    }

    const isValid = body.every(
      (item) => typeof item.A_Code === "string" && typeof item.A_Name === "string" && typeof item.A_Code_C === "string" && Array.from({ length: 10 }, (_, i) => item[`Sell_Price${i + 1}`]).every((v) => typeof v === "number") && typeof item.Buy_Price === "number" && typeof item.Exist === "number"
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid product format." }, { status: 400 });
    }

    await ensureDataDir();
    await fs.writeFile(FILE_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ message: "Data saved successfully." });
  } catch {
    return NextResponse.json({ error: "Failed to write data." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await ensureDataDir();
    await fs.writeFile(FILE_PATH, "", "utf-8");
    return NextResponse.json({ message: "File content deleted." });
  } catch {
    return NextResponse.json({ error: "Failed to delete file." }, { status: 500 });
  }
}
