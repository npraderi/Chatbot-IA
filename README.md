This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Chatbot La Damerica

## Configuración de Firebase Admin SDK

Para que la funcionalidad de eliminación de usuarios funcione correctamente, es necesario configurar Firebase Admin SDK con una cuenta de servicio. Sigue estos pasos:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Configuración del proyecto > Cuentas de servicio
4. Haz clic en "Generar nueva clave privada"
5. Descarga el archivo JSON de la clave
6. Agrega la siguiente variable de entorno en tu archivo `.env.local`:

```
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"tu-proyecto-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nTu-clave-privada-con-saltos-de-linea-como-\\n\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

> **IMPORTANTE:** El formato correcto de esta variable es crítico:
>
> - Todo el JSON debe estar entre comillas simples
> - Los valores dentro del JSON deben usar comillas dobles
> - Los saltos de línea en `private_key` deben preservarse como `\n`
> - No debe haber espacios adicionales al principio o final

### Consejos para convertir el archivo de claves a formato correcto:

1. Abre el archivo JSON descargado
2. Copia todo su contenido
3. Usa un convertidor en línea o un script para:
   - Convertir todo a una sola línea
   - Asegurar que los saltos de línea en private_key se mantengan como `\n`
   - Escapar correctamente las comillas
4. El JSON resultante debe envolvere con comillas simples: `'{ ... }'`

También puedes agregar:

```
FIREBASE_DATABASE_URL="https://tu-proyecto-id.firebaseio.com"
```
