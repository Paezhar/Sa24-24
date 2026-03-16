import { defineConfig } from 'vite'
import { default as react } from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Commit changes.**

Ensuite vérifie que ton repo contient aussi `index.html` à la racine — c'est requis par Vite. S'il n'est pas là, crée-le aussi :

Nomme le fichier :
```
index.html
