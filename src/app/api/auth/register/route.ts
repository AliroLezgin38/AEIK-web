import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getUserFromRequest, hashPassword, signToken } from '@/lib/jwt';

// Qeydiyyat yalnız owner/admin tərəfindən aparılır; açıq qeydiyyat bağlıdır.
export async function POST(req: Request) {
  try {
    const caller = getUserFromRequest(req);
    if (!caller) {
      return NextResponse.json({ error: 'Giriş edilməyib və ya token etibarsızdır.' }, { status: 401 });
    }

    if (caller.role !== 'owner' && caller.role !== 'admin') {
      return NextResponse.json({ error: 'Yeni hesab yaratmaq səlahiyyətiniz yoxdur.' }, { status: 403 });
    }

    const { email, password, displayName, department } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Bütün vacib xanaları doldurun.' },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { error: 'Verilənlər bazasına qoşulmaq mümkün olmadı.' },
        { status: 503 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email ünvanı ilə artıq qeydiyyat mövcuddur.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const count = await User.countDocuments();
    // İlk istifadəçi avtomatik 'owner' olur, növbətilər isə 'member'
    const role: 'owner' | 'admin' | 'member' = count === 0 ? 'owner' : 'member';

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName,
      department: department || 'Layihələrin idarə olunması',
      role,
      createdAt: Date.now(),
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    return NextResponse.json({
      user: {
        uid: newUser._id.toString(),
        email: newUser.email,
        displayName: newUser.displayName,
        department: newUser.department,
        role: newUser.role,
      },
      token,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Qeydiyyat zamanı xəta baş verdi.' },
      { status: 500 }
    );
  }
}
