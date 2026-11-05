# Leonardo Colás Leyva — Portafolio

Portafolio profesional de una sola página, localizado en español e inglés. La fuente bilingüe de la web y del CV está en `src/data/cv.json`; su traducción al inglés es fiel a la información recibida y mantiene por separado la experiencia profesional y la práctica adicional.

## Desarrollo

Requiere Node.js 22+, pnpm 11.25.0 y Python 3. Para trabajar en el sitio: `pnpm install`, después `pnpm dev`. Para comprobar tipos y construir la web: `pnpm typecheck` y `pnpm build`.

## Generación de los PDFs

Los PDFs completos se generan a partir de la misma fuente bilingüe para no divergir del contenido de la web:

```sh
python3 -m pip install -r requirements.txt
python3 scripts/generate_pdfs.py
```

Los dos archivos resultantes quedan en `generated-pdfs/`: `Leonardo-Colas-Leyva-CV-ES.pdf` y `Leonardo-Colas-Leyva-CV-EN.pdf`. El generador usa DejaVu Sans del sistema con soporte Unicode. Cambia `src/data/cv.json` y vuelve a ejecutar el script antes de reemplazar las copias durables vinculadas por las descargas de la web.
