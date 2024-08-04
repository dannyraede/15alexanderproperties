import { del, list } from '@vercel/blob';

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

// Modify the handler function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const deletedCount = await deleteOldBlobs();
    return res.status(200).send(`Deleted ${deletedCount} old blobs`);
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).send('Cleanup failed');
  }
}
