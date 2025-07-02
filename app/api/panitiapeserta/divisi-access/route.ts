import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { db, RowDataPacket } from "@/lib/db";

interface PanitiaData extends RowDataPacket {
  id: number;
  nama_lengkap: string;
  email: string;
  divisi_id: number;
  jabatan_id: number;
  divisi_nama: string;
  jabatan_nama: string;
}

export async function POST(req: Request) {
  try {
    // 1. Verify session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          hasAccess: false, 
          error: "Not authenticated",
          redirectPath: "/api/auth/signin"
        },
        { status: 401 }
      );
    }

    // 2. Parse request body (optional, bisa juga langsung dari session)
    const body = await req.json();
    const { email } = body;
    
    // 3. Security check - pastikan email sama dengan session
    const checkEmail = email || session.user.email;
    if (checkEmail !== session.user.email) {
      return NextResponse.json(
        { 
          hasAccess: false, 
          error: "Email mismatch",
          redirectPath: "/"
        },
        { status: 403 }
      );
    }

    console.log(`🔍 Checking divisi access for: ${checkEmail}`);

    // 4. Get user's divisi data
    const [rows] = await db.query<PanitiaData[]>(`
      SELECT 
        p.id, 
        p.nama_lengkap, 
        p.email,
        p.divisi_id,
        p.jabatan_id,
        d.nama as divisi_nama,
        j.nama as jabatan_nama
      FROM panitia p
      INNER JOIN divisi d ON p.divisi_id = d.id
      INNER JOIN jabatan j ON p.jabatan_id = j.id
      WHERE p.email = ?
    `, [checkEmail]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        hasAccess: false,
        error: "User not found in panitia table",
        redirectPath: "/"
      }, { status: 404 });
    }

    const panitiaData = rows[0];
    
    console.log(`📊 User data found: ${panitiaData.nama_lengkap} - Divisi ID: ${panitiaData.divisi_id} (${panitiaData.divisi_nama})`);

    // 5. Determine redirect path based on divisi_id
    let redirectPath = "/dashboard"; // Default fallback
    let accessGranted = true;
    let dashboardType = "default";

    switch (panitiaData.divisi_id) {
      case 6: // KESTARI
        redirectPath = "/dashboardkestari";
        dashboardType = "kestari";
        console.log(`✅ KESTARI user detected, redirecting to: ${redirectPath}`);
        break;
        
      case 7: // Konsumsi  
        redirectPath = "/dashboardkonsumsi";
        dashboardType = "konsumsi";
        console.log(`✅ Konsumsi user detected, redirecting to: ${redirectPath}`);
        break;

      case 11: // PIT - Special case: can access both kestari and konsumsi
        // Default PIT ke dashboard kestari, tapi mereka punya akses ke keduanya
        redirectPath = "/dashboardkestari";
        dashboardType = "pit_special"; // Special type for PIT users
        console.log(`✅ PIT user detected, redirecting to: ${redirectPath} (has access to both)`);
        break;
        
      default:
        // Semua divisi lain ke dashboard default
        redirectPath = "/dashboard";
        dashboardType = "default";
        console.log(`✅ Other divisi (${panitiaData.divisi_nama}), redirecting to: ${redirectPath}`);
        break;
    }

    return NextResponse.json({
      hasAccess: accessGranted,
      redirectPath: redirectPath,
      dashboardType: dashboardType,
      panitiaData: {
        id: panitiaData.id,
        nama_lengkap: panitiaData.nama_lengkap,
        email: panitiaData.email,
        divisi_id: panitiaData.divisi_id,
        jabatan_id: panitiaData.jabatan_id,
        divisi_nama: panitiaData.divisi_nama,
        jabatan_nama: panitiaData.jabatan_nama
      },
      message: `Access granted for ${panitiaData.divisi_nama} dashboard`,
      // Add special permissions info for PIT users
      specialPermissions: panitiaData.divisi_id === 11 ? {
        canAccessKestari: true,
        canAccessKonsumsi: true,
        note: "PIT users have access to both Kestari and Konsumsi dashboards"
      } : null
    }, { status: 200 });

  } catch (error: any) {
    console.error("💥 Error checking divisi access:", error);
    
    return NextResponse.json(
      { 
        hasAccess: false, 
        error: "Database error",
        redirectPath: "/dashboard",
        message: "Failed to verify divisi access",
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}

// GET method untuk debugging (development only)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: "Debug endpoint only available in development" },
      { status: 405 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Debug: Show divisi mapping with updated rules
    const [divisiMapping] = await db.query(`
      SELECT 
        d.id as divisi_id,
        d.nama as divisi_nama,
        COUNT(p.id) as total_panitia,
        CASE 
          WHEN d.id = 6 THEN '/dashboardkestari'
          WHEN d.id = 7 THEN '/dashboardkonsumsi'
          WHEN d.id = 11 THEN '/dashboardkestari (PIT - can access both)'
          ELSE '/dashboard'
        END as redirect_path
      FROM divisi d
      LEFT JOIN panitia p ON d.id = p.divisi_id
      GROUP BY d.id, d.nama
      ORDER BY d.id ASC
    `);

    // Debug: Show current user info
    const [currentUser] = await db.query<PanitiaData[]>(`
      SELECT 
        p.id, 
        p.nama_lengkap, 
        p.email,
        p.divisi_id,
        d.nama as divisi_nama
      FROM panitia p
      INNER JOIN divisi d ON p.divisi_id = d.id
      WHERE p.email = ?
    `, [session.user.email]);

    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      currentUser: currentUser[0] || null,
      divisiMapping: divisiMapping,
      redirectRules: {
        "divisi_id = 6": "/dashboardkestari (KESTARI only)",
        "divisi_id = 7": "/dashboardkonsumsi (Konsumsi only)", 
        "divisi_id = 11": "/dashboardkestari (PIT - can access both kestari & konsumsi)",
        "others": "/dashboard (Default)"
      },
      accessMatrix: {
        dashboardkestari: "Accessible by divisi_id: 6 (KESTARI), 7 (Konsumsi), 11 (PIT)",
        dashboardkonsumsi: "Accessible by divisi_id: 7 (Konsumsi), 11 (PIT)"
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      debug: true,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}