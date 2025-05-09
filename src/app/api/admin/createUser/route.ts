import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/firebase-admin";
import { UserRole } from "@/services/authService";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar Admin SDK
    const admin = await initAdmin();

    // Verificar la autenticación del usuario que hace la petición
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(session);
    if (!decodedClaims) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario que hace la petición es admin
    const adminId = decodedClaims.uid;
    const adminDoc = await admin
      .firestore()
      .collection("users")
      .doc(adminId)
      .get();
    const adminData = adminDoc.data();

    if (!adminDoc.exists || adminData?.role !== "Admin") {
      return NextResponse.json(
        { error: "Solo los administradores pueden crear usuarios" },
        { status: 403 }
      );
    }

    // Obtener los datos de la solicitud
    const userData: CreateUserRequest = await request.json();

    // Validar datos
    if (!userData.email || !userData.password || !userData.name) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Crear el usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
    });

    // Crear documento en Firestore
    const newUser = {
      id: userRecord.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role || "User",
    };

    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set(newUser);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: unknown) {
    console.error("Error al crear usuario:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    // Detectar errores específicos de Firebase
    if (errorMessage.includes("auth/email-already-in-use")) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }
    if (errorMessage.includes("auth/invalid-email")) {
      return NextResponse.json(
        { error: "El email no es válido" },
        { status: 400 }
      );
    }
    if (errorMessage.includes("auth/weak-password")) {
      return NextResponse.json(
        { error: "La contraseña es demasiado débil" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear el usuario", details: errorMessage },
      { status: 500 }
    );
  }
}
