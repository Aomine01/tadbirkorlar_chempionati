import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      console.error('Missing Google API environment variables');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Google Sheets API setup
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure newlines are parsed correctly
      },
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // The spreadsheet ID
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Fetch spreadsheet details to get the name of the first sheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    // Get the exact name of the first available sheet (e.g. "Sheet1" or "Лист1" or "1-varaq")
    const firstSheetName = spreadsheet.data.sheets?.[0]?.properties?.title || 'Sheet1';

    // Append to the first sheet dynamically
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${firstSheetName}!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [email, new Date().toISOString()]
        ]
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error appending to google sheets:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
