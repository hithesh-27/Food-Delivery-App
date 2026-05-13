# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Deploying this frontend

This app can be deployed as a Render Static Site from the `frontend` folder.

1. Connect the GitHub repo `hithesh-27/Food-Delivery-App`.
2. Set the root directory to `frontend`.
3. Use these commands:
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
4. Add environment variable:
   - `VITE_BACKEND_URL=https://food-del-backend-2-tho7.onrender.com`
5. Deploy.

After the front-end is live, set the backend `FRONTEND_URL` environment variable to the front-end URL.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
