// src/server.ts
import app from './app';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
