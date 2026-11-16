# Leonardo Colás Leyva — Portafolio

Portafolio profesional de una sola página, localizado en español e inglés. La fuente bilingüe de la web y del CV está en `src/data/cv.json`; su traducción al inglés es fiel a la información recibida y mantiene por separado la experiencia profesional y la práctica adicional.

## Desarrollo

Requiere Node.js 22+, pnpm 11.25.0 y Python 3. Para trabajar en el sitio: `pnpm install`, después `pnpm dev` (http://localhost:3000). Para comprobar tipos y construir la web: `pnpm typecheck` y `pnpm build`.

## Descarga de los CV en PDF

Los CV oficiales viven en `public/cv/` y son los que enlazan los botones de descarga de la web:

- `public/cv/Leonardo-Colas-Leyva-CV-ES.pdf` (español)
- `public/cv/Leonardo-Colas-Leyva-CV-EN.pdf` (inglés)

El botón «Descargar CV» de la portada ofrece un menú para elegir el idioma y descarga el archivo elegido; la sección de descargas ofrece además los dos enlaces por separado. Para actualizar un CV, sustituye el PDF correspondiente en `public/cv/` manteniendo el mismo nombre y vuelve a desplegar.

## Borradores del CV desde la web (opcional)

`scripts/generate_pdfs.py` genera un borrador del CV a partir de `src/data/cv.json` sin tocar los PDFs oficiales:

```sh
python3 -m pip install -r requirements.txt
python3 scripts/generate_pdfs.py
```

Los archivos quedan en `generated-pdfs/` (ignorados por git). El generador busca DejaVu Sans en el sistema y, si no está disponible, recurre a Arial o Segoe UI (Linux, macOS y Windows).

## Despliegue en Vercel

El sitio es una SPA estática con Vite: importa el repositorio en Vercel (detecta Vite automáticamente) o ejecuta `vercel` desde la carpeta. `vercel.json` fija `buildCommand: pnpm build` y `outputDirectory: dist`, y los PDFs de `public/` se publican junto con la web.
