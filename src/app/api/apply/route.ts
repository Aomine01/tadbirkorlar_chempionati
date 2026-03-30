import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, surname, phone, email, age, businessType, businessDuration } = body;

    // Basic validation
    if (!name || !surname || !phone || !email || !age || !businessType || !businessDuration) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_SHEET_ID
    ) {
      console.error('Missing Google API environment variables');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Google Sheets API setup
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Fetch spreadsheet details to get sheet names
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });

    // Use "Applications" sheet if it exists, otherwise use the first sheet
    const allSheets = spreadsheet.data.sheets ?? [];
    const applicationsSheet = allSheets.find(
      (s) => s.properties?.title?.toLowerCase() === 'applications'
    );
    const targetSheet =
      applicationsSheet?.properties?.title ??
      allSheets[0]?.properties?.title ??
      'Sheet1';

    // Append the form row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${targetSheet}!A:H`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            name,
            surname,
            phone,
            email,
            age,
            businessType,
            businessDuration,
            new Date().toISOString(),
          ],
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
