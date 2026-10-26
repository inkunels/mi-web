# wallcraftpanels

Web premium de paneles de revestimiento para fachadas, residencias y retail de lujo: madera, aluminio, piedra, granito y perfiles 3D, con un estudio 3D que va del boceto al render final.

**Web publicada:** https://wallcraftpanels.ch

## Requisitos

- Node.js 20.19 o superior

## Uso

```bash
npm install
npm run dev
```

Para generar la versión de producción en `dist/`:

```bash
npm run build
```

## Tecnología

React, TypeScript y Vite · Motion · Three.js con React Three Fiber · Lenis

## Publicación

La web se sirve con GitHub Pages desde la rama `gh-pages`, que contiene la compilación de `dist/` (`npm run build`).

El dominio `wallcraftpanels.ch` está registrado en Hostinger. Sus DNS apuntan a GitHub Pages con cuatro registros A (`185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`) y un CNAME de `www` a `inkunels.github.io`. El archivo `public/CNAME` se copia en cada compilación para que GitHub Pages mantenga el dominio.
