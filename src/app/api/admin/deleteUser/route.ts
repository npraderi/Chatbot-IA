import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/firebase-admin";

export async function DELETE(request: NextRequest) {
  try {
    // Obtener el UID del usuario a eliminar
    const uid = request.nextUrl.searchParams.get("uid");
    if (!uid) {
      return NextResponse.json(
        { error: "Se requiere el UID del usuario" },
        { status: 400 }
      );
    }

    // Verificar la autenticación del usuario que hace la petición
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      console.error("Error: No se encontró cookie de sesión");
      return NextResponse.json(
        {
          error: "No autorizado",
          details: "No se encontró cookie de sesión",
        },
        { status: 401 }
      );
    }

    // Inicializar Admin SDK antes de verificar la sesión
    const admin = await initAdmin();

    // Verificar la sesión
    const decodedClaims = await verifySessionCookie(session);
    if (!decodedClaims) {
      console.error("Error: Cookie de sesión inválida");
      return NextResponse.json(
        {
          error: "No autorizado",
          details: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    // Verificar que el usuario que hace la petición es admin
    const adminId = decodedClaims.uid;

    try {
      const adminDoc = await admin
        .firestore()
        .collection("users")
        .doc(adminId)
        .get();

      const adminData = adminDoc.data();

      if (
        !adminDoc.exists ||
        (adminData?.role !== "Admin" && adminData?.role !== "SuperAdmin")
      ) {
        console.error("Error: El usuario no es administrador", {
          adminId,
          role: adminData?.role,
        });
        return NextResponse.json(
          {
            error: "Solo los administradores pueden eliminar usuarios",
            details: "Tu cuenta no tiene permisos de administrador",
          },
          { status: 403 }
        );
      }

      // Verificar que no se está intentando eliminar a sí mismo
      if (adminId === uid) {
        return NextResponse.json(
          { error: "No puedes eliminar tu propio usuario" },
          { status: 403 }
        );
      }

      // Obtener información del usuario a eliminar para verificar roles
      const userToDeleteDoc = await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .get();

      const userToDeleteData = userToDeleteDoc.data();

      // Si el usuario a eliminar es Admin, verificar que quien lo elimina es SuperAdmin
      if (
        userToDeleteData?.role === "Admin" &&
        adminData?.role !== "SuperAdmin"
      ) {
        return NextResponse.json(
          { error: "Solo un SuperAdmin puede eliminar usuarios Admin" },
          { status: 403 }
        );
      }

      // Nadie puede eliminar a un SuperAdmin
      if (userToDeleteData?.role === "SuperAdmin") {
        return NextResponse.json(
          { error: "No se puede eliminar a un SuperAdmin" },
          { status: 403 }
        );
      }

      // Eliminar el usuario de Firebase Auth
      try {
        await admin.auth().deleteUser(uid);
      } catch (authError) {
        const errorMsg =
          authError instanceof Error ? authError.message : "Error desconocido";
        console.error(
          `Error al eliminar usuario de Auth (Firebase): ${errorMsg}`
        );
        return NextResponse.json(
          {
            error: "Error al eliminar el usuario de Auth",
            details: errorMsg,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Usuario eliminado correctamente de Firebase Auth",
      });
    } catch (firestoreError) {
      console.error(
        "Error al verificar permisos de administrador:",
        firestoreError
      );
      return NextResponse.json(
        {
          error: "Error al verificar permisos",
          details:
            firestoreError instanceof Error
              ? firestoreError.message
              : "Error al acceder a Firestore",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error general al eliminar usuario:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al eliminar el usuario", details: errorMessage },
      { status: 500 }
    );
  }
}
