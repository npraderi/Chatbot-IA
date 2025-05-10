import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionCookie, verifySessionCookie } from "@/lib/firebase-admin";

// Endpoint para crear una cookie de sesión
export async function POST(request: NextRequest) {
  try {
    const { idToken, expiresIn = 60 * 60 * 24 * 5 * 1000 } =
      await request.json(); // 5 días por defecto

    if (!idToken) {
      return NextResponse.json(
        { error: "Se requiere un token ID" },
        { status: 400 }
      );
    }

    try {
      // Crear cookie de sesión
      const sessionCookie = await createSessionCookie(idToken, expiresIn);

      // Configurar cookie en la respuesta
      const cookieOptions = {
        name: "session",
        value: sessionCookie,
        maxAge: expiresIn / 1000, // convertir a segundos
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict" as const,
      };

      // Crear respuesta
      const response = NextResponse.json({ success: true });

      // Establecer la cookie
      response.cookies.set(cookieOptions);

      return response;
    } catch (cookieError) {
      console.error("Error al crear cookie de sesión:", cookieError);
      // No lanzar el error para evitar la cascada, sino devolver respuesta con error
      return NextResponse.json(
        {
          error: "Error al crear cookie de sesión",
          details:
            cookieError instanceof Error
              ? cookieError.message
              : "Error desconocido",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error al procesar solicitud de sesión:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al procesar la solicitud", details: errorMessage },
      { status: 500 }
    );
  }
}

// Endpoint para verificar o eliminar la sesión
export async function DELETE() {
  // Eliminar la cookie de sesión
  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  return response;
}

// Endpoint para verificar la sesión actual
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    return NextResponse.json({
      authenticated: !!decodedClaims,
      user: decodedClaims,
    });
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    return NextResponse.json({ authenticated: false });
  }
}
