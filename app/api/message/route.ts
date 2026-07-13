import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const POST = async (request: NextRequest) => {
  try {
    const { cookieId, message } = await request.json();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      valueInputOption: "USER_ENTERED",
      range: "Sheet1!A:C",
      requestBody: {
        values: [[new Date().toISOString(), cookieId, message]],
      },
    });

    return NextResponse.json({ success: true, message: "Success" });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          (error as { message: string }).message || "Something went wrong",
      },
      { status: 500 },
    );
  }
};
