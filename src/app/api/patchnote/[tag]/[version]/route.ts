import { HttpStatusCode } from 'axios';
import fs from 'fs';
import { NextRequest } from 'next/server';
const patch_notes_path = './docs/patches';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tag: string; version: string }> }
) {
  const parameter = await params;
  const tag = parameter.tag;
  const version = parameter.version;
  if (!tag)
    return Response.json(
      {
        message: 'BAD_REQUEST: Missing patch note tag parameter',
      },
      { status: HttpStatusCode.BadRequest }
    );

  if (!version)
    return Response.json(
      {
        message: 'BAD_REQUEST: Missing patch note version parameter',
      },
      { status: HttpStatusCode.BadRequest }
    );

  const tags = fs.readdirSync(patch_notes_path);
  const findTag = tags.find(patch => patch === tag);

  if (!findTag || findTag?.length === 0)
    return Response.json(
      {
        message: `NOT_FOUND: Patch note tag ${tag} is not found`,
        available_tags: tags,
      },
      { status: HttpStatusCode.NotFound }
    );

  const patch_notes = fs.readdirSync(`${patch_notes_path}/${tag}`);
  const findPatchNotes = patch_notes.find(notes => notes === version);
  if (!findPatchNotes || findPatchNotes?.length === 0)
    return Response.json(
      {
        message: `NOT_FOUND: Patch note version ${version} is not found`,
        available_tags: patch_notes,
      },
      { status: HttpStatusCode.NotFound }
    );

  const readNote = fs.readFileSync(
    `${patch_notes_path}/${tag}/${version}`,
    'utf-8'
  );
  return new Response(readNote, {
    headers: {
      'Content-Type': 'text/plain',
    },
    status: HttpStatusCode.Ok,
  });
}
