import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPER_ADMIN_EMAIL = '38mhamdy@gmail.com';

const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase Environment Variables for Admin Client');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export async function GET(request: Request) {
  try {
    // 1. Verify caller user via auth header or cookie? Wait, better to just rely on client sending token or use Next.js cookies
    // For simplicity, we can fetch all users. The layout.tsx protects the /admin page.
    // However, API routes can be hit directly. We should verify the user token.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createAdminClient();
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user || user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;
    
    return NextResponse.json(users);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createAdminClient();
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user || user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const targetUserId = body.userId;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Protection: Prevent deleting the Super Admin
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (targetUser?.user?.email === SUPER_ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Cannot delete Super Admin account' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
