import GoogleProvider from "next-auth/providers/google";
import type { AuthOptions, Profile } from "next-auth";
import { db } from "@/lib/db";

// Extend the Session user type to include 'id' and 'divisi_id'
declare module "next-auth" {
  interface Session {
    user: {
      id?: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      divisi_id?: number;
      divisi_nama?: string;
    };
  }
}

// Extend JWT token type to include divisi information
declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
    divisi_id?: number;
    divisi_nama?: string;
    picture?: string;
  }
}

// Extend Profile type to include Google-specific properties
interface GoogleProfile extends Profile {
  picture?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!profile?.email) return false;

      const email = profile.email;
      const domain = email.split("@")[1];

      // Hanya izinkan email UB
      if (domain !== "student.ub.ac.id") {
        return "/?error=EmailNotStudentUB";
      }

      try {
        const userName = user.name || profile.name || "";
        // Prioritaskan Google image dari profile dengan type casting
        const googleProfile = profile as GoogleProfile;
        const userImage = googleProfile.picture || user.image || "";

        // Cek apakah user sudah ada di tabel users
        const [userRows] = await db.query(
          "SELECT id FROM users WHERE email = ?",
          [email]
        );
        const userExists = Array.isArray(userRows) && userRows.length > 0;

        if (userExists) {
          // Update users table dengan Google image terbaru
          await db.query(
            "UPDATE users SET name = ?, image = ? WHERE email = ?",
            [userName, userImage, email]
          );
        } else {
          // Buat user baru dengan Google image
          await db.query(
            "INSERT INTO users (email, name, image) VALUES (?, ?, ?)",
            [email, userName, userImage]
          );
        }

        // Cek apakah user terdaftar sebagai panitia dan get divisi info
        const [panitiaRows] = await db.query(
          `SELECT 
            p.id, 
            p.nama_lengkap, 
            p.divisi_id,
            d.nama as divisi_nama
          FROM panitia p
          INNER JOIN divisi d ON p.divisi_id = d.id
          WHERE p.email = ?`,
          [email]
        );
        const isPanitia = Array.isArray(panitiaRows) && panitiaRows.length > 0;

        if (!isPanitia) {
          return "/?error=NotRegisteredPanitia";
        }

        // Update name di panitia jika ada dan berbeda
        const panitiaData = panitiaRows[0] as any;
        if (userName && panitiaData.nama_lengkap !== userName) {
          await db.query(
            "UPDATE panitia SET nama_lengkap = ? WHERE email = ?",
            [userName, email]
          );
        }

        // Debug: Log user info with divisi
        console.log("🔍 Sign-in Success - User Info:", {
          email,
          name: userName,
          image: userImage,
          divisi_id: panitiaData.divisi_id,
          divisi_nama: panitiaData.divisi_nama,
          profile_picture: googleProfile.picture,
          user_image: user.image
        });

        return true;
      } catch (error) {
        console.error("Database error during sign-in:", error);
        return "/?error=DatabaseError";
      }
    },

    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          // Get user data with divisi info from database
          const [rows] = await db.query(
            `SELECT 
              u.id, 
              u.email, 
              u.name, 
              u.image,
              p.divisi_id,
              d.nama as divisi_nama
            FROM users u
            INNER JOIN panitia p ON u.email = p.email
            INNER JOIN divisi d ON p.divisi_id = d.id
            WHERE u.email = ?`,
            [session.user.email]
          );

          if (Array.isArray(rows) && rows.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUser = rows[0] as any;
            
            // Update session dengan data dari database
            session.user.id = dbUser.id;
            session.user.divisi_id = dbUser.divisi_id;
            session.user.divisi_nama = dbUser.divisi_nama;
            if (dbUser.name) session.user.name = dbUser.name;
            
            // Prioritaskan Google image dari token, fallback ke database
            if (token.picture) {
              session.user.image = token.picture as string;
            } else if (dbUser.image) {
              session.user.image = dbUser.image;
            }
            
            console.log("🔍 Session callback - Final user data:", {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              divisi_id: session.user.divisi_id,
              divisi_nama: session.user.divisi_nama,
              source: token.picture ? 'token' : 'database'
            });
          }
        } catch (error) {
          console.error("Database error during session retrieval:", error);
        }
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {
      // Tambahkan data user ke token jika ada
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      
      // Update token dengan Google image dari profile saat fresh login
      if (account && profile) {
        const googleProfile = profile as GoogleProfile;
        if (googleProfile.picture) {
          token.picture = googleProfile.picture;
        }

        // Get divisi info for new login and add to token
        if (profile.email) {
          try {
            const [panitiaRows] = await db.query(
              `SELECT 
                p.divisi_id,
                d.nama as divisi_nama
              FROM panitia p
              INNER JOIN divisi d ON p.divisi_id = d.id
              WHERE p.email = ?`,
              [profile.email]
            );

            if (Array.isArray(panitiaRows) && panitiaRows.length > 0) {
              const panitiaData = panitiaRows[0] as any;
              token.divisi_id = panitiaData.divisi_id;
              token.divisi_nama = panitiaData.divisi_nama;
              
              console.log("🔍 JWT callback - Added divisi to token:", {
                email: profile.email,
                divisi_id: token.divisi_id,
                divisi_nama: token.divisi_nama
              });
            }
          } catch (error) {
            console.error("Error adding divisi to token:", error);
          }
        }
      }
      
      return token;
    },

    // Custom redirect berdasarkan divisi menggunakan API divisi-access
    async redirect({ url, baseUrl }) {
      // Jika URL sudah absolut dan bukan dari domain yang sama, gunakan baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Redirect ke auth/redirect-checker untuk divisi-based redirect
      return `${baseUrl}/auth/redirect-checker`;
    }
  },
  pages: {
    signIn: "/", // Konsisten dengan redirect yang digunakan
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};