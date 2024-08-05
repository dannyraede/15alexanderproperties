import { del, list } from '@vercel/blob';

/**
 * Deletes blobs older than 7 days from the specified prefix.
 * @param {string|null} cursor - Pagination cursor for listing blobs.
 * @returns {Promise<number>} The number of deleted blobs.
 */
async function deleteOldBlobs(cursor = null) {
  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let deletedCount = 0;
  let hasMore = true;

  // Continue fetching and deleting blobs while there are more to process
  while (hasMore) {
    // List blobs with pagination
    const { blobs, cursor: nextCursor } = await list({ prefix: '15alexanderproperties-blob', limit: 100, cursor });
    
    // Filter blobs older than 7 days
    const oldBlobs = blobs.filter(blob => new Date(blob.uploadedAt) < sevenDaysAgo);

    // Delete old blobs
    for (const blob of oldBlobs) {
      await del(blob.url);
      console.log(`Deleted blob: ${blob.url}`);
      deletedCount++;
    }

    // Update cursor for next iteration or end loop if no more blobs
    if (nextCursor) {
      cursor = nextCursor;
    } else {
      hasMore = false;
    }
  }

  return deletedCount;
}

/**
 * Handler function for the cleanup API endpoint.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Verify the authorization header
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Unauthorized');
  }

  try {
    // Execute the blob deletion process
    const deletedCount = await deleteOldBlobs();
    return res.status(200).send(`Deleted ${deletedCount} old blobs from 15alexanderproperties-blob`);
  } catch (error) {
    // Log and return any errors encountered during the cleanup process
    console.error('Cleanup error:', error);
    return res.status(500).send('Cleanup failed');
  }
}
