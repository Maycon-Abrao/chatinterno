# Chat Interno - FastAPI + WebSocket

Este é um chat interno simples, com frontend em HTML/CSS/JS e backend em Python (FastAPI).

## subir para o GitHub

1. Crie um repositório no GitHub (ex: chat-interno).
2. No terminal, dentro da pasta do projeto, execute:

```sh
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/mayconDenis/maycon01abrao@gmail.com.git
git push -u origin main
```

Troque `SEU_USUARIO` e `SEU_REPOSITORIO` pelo seu usuário e nome do repositório.

## Estrutura dos arquivos
- app.py (backend FastAPI)
- index.html (frontend)
- style.css (estilo)
- script.js (lógica do chat)

## Deploy na nuvem (Render)
1. Faça login em https://render.com
2. Clique em "New Web Service" e conecte ao seu repositório do GitHub
3. Configure:
   - Build Command: `pip install fastapi uvicorn`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port 10000`
4. Após publicar, use a URL fornecida pelo Render no seu script.js (WebSocket e fetch)

## Requisitos para rodar localmente
- Python 3.8+
- Instale dependências:
  ```sh
  pip install fastapi uvicorn
  ```
- Execute:
  ```sh
  python app.py
  ```

Pronto! Qualquer dúvida, só perguntar.
