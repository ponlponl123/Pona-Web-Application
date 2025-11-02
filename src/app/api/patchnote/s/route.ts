import { HttpStatusCode } from 'axios';
import fs from 'fs';
const patch_notes_path = './docs/patches';

export async function GET() {
  const tags = fs.readdirSync(patch_notes_path);

  return Response.json(
    {
      message: 'OK',
      available_tags: tags,
      available_notes: tags.map(t => {
        const versions = fs.readdirSync(`${patch_notes_path}/${t}`, {
          withFileTypes: false,
        });

        // Sort versions by date from line 5 of each markdown file
        const versionsWithDates = versions.map(v => {
          try {
            const content = fs.readFileSync(
              `${patch_notes_path}/${t}/${v}`,
              'utf-8'
            );
            const lines = content.split('\n');
            const dateLine = lines[4]; // Line 5 (0-indexed)

            // Extract date from line like: `🌹 14 Febrary 2025`
            const dateMatch = dateLine.match(/`[^\d]*(\d+)\s+(\w+)\s+(\d+)`/);
            if (dateMatch) {
              const [, day, month, year] = dateMatch;
              const date = new Date(`${month} ${day}, ${year}`);
              return { version: v, date: date.getTime() };
            }
          } catch (error) {
            console.error(`Error reading date from ${v}:`, error);
          }
          return { version: v, date: 0 };
        });

        // Sort by date descending (newest first)
        versionsWithDates.sort((a, b) => b.date - a.date);

        return {
          tag: t,
          versions: versionsWithDates.map(v => v.version),
        };
      }),
    },
    { status: HttpStatusCode.Ok }
  );
}
