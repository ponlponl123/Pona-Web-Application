import { HttpStatusCode } from 'axios';
import fs from 'fs';
const patch_notes_path = './docs/patches';

export async function GET() {
  const tags = fs.readdirSync(patch_notes_path);
  
  return Response.json({
    message: 'OK',
    available_tags: tags,
    available_notes: tags.map(t => {
      return {
        tag: t,
        versions: fs.readdirSync(`${patch_notes_path}/${t}`, {
          withFileTypes: false
        }).reverse()
      }
    })
  }, {status: HttpStatusCode.Ok})
}