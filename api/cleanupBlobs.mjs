import { del, list } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

async function deleteOldBlobs(cursor = null) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let deletedCount = 0;
  let hasMore = true;

  while (hasMore) {
    const { blobs, cursor: nextCursor } = await list({ limit: 100, cursor });
    const oldBlobs = blobs.filter(blob => new Date(blob.uploadedAt) < sevenDaysAgo);

    for (const blob of oldBlobs) {
      await del(blob.url);
      console.log(`Deleted blob: ${blob.url}`);
      deletedCount++;
    }

    if (nextCursor) {
      cursor = nextCursor;
    } else {
      hasMore = false;
    }
  }

  return deletedCount;
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const deletedCount = await deleteOldBlobs();
    return new Response(`Deleted ${deletedCount} old blobs`, { status: 200 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response('Cleanup failed', { status: 500 });
  }
}
