import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      return NextResponse.json(
        {
          error: "FIREBASE_SERVICE_ACCOUNT_KEY no está configurado",
        },
        { status: 500 }
      );
    }

    // Extraer información segura para depuración
    const keyLength = serviceAccountKey.length;
    const firstChars = serviceAccountKey.substring(0, 20);
    const startsWithSingleQuote = serviceAccountKey.startsWith("'");
    const endsWithSingleQuote = serviceAccountKey.endsWith("'");
    const startsWithDoubleQuote = serviceAccountKey.startsWith('"');
    const endsWithDoubleQuote = serviceAccountKey.endsWith('"');
    const startsWithCurlyBrace = serviceAccountKey.startsWith("{");
    const containsTypeField = serviceAccountKey.includes('"type"');

    // Intentar limpiar la cadena
    let cleaned = serviceAccountKey.trim();
    if (
      (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
      (cleaned.startsWith('"') && cleaned.endsWith('"'))
    ) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }

    // Verificar si es base64 válido
    let isBase64 = false;
    let base64Decoded = null;
    try {
      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      if (base64Regex.test(serviceAccountKey)) {
        base64Decoded =
          Buffer.from(serviceAccountKey, "base64").toString().substring(0, 20) +
          "...";
        isBase64 = true;
      }
    } catch (e) {
      console.log(e);
    }

    return NextResponse.json({
      debug: {
        keyLength,
        excerpt: firstChars + "...",
        format: {
          startsWithSingleQuote,
          endsWithSingleQuote,
          startsWithDoubleQuote,
          endsWithDoubleQuote,
          startsWithCurlyBrace,
          containsTypeField,
          isBase64,
        },
        cleanedExcerpt: cleaned.substring(0, 20) + "...",
        base64DecodedExcerpt: base64Decoded,
      },
      message:
        "Esta ruta es solo para depuración y debe ser eliminada en producción.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error al procesar la depuración",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
