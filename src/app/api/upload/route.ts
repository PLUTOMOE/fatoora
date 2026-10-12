import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase Environment Variables');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال أي ملف' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const bucketName = 'entity-assets';

    // Verify / create bucket if not already present
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some(b => b.name === bucketName || b.id === bucketName)) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
    }

    const ext = file.name.split('.').pop() || 'png';
    const finalPath = path || `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(finalPath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(finalPath);

    return NextResponse.json({ publicUrl, path: finalPath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'فشل في رفع الملف' }, { status: 500 });
  }
}
