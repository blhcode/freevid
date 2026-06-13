-- Run this in Supabase SQL Editor if uploads fail with
-- "The object exceeded the maximum allowed size".
--
-- Also required: Supabase dashboard → Storage → Settings →
-- set "Global file size limit" to 50 MB (max on the free plan).

update storage.buckets
set file_size_limit = null
where id = 'videos';
