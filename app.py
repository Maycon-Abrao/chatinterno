from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# CORS (ok)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos em /static
app.mount("/static", StaticFiles(directory="static", html=True), name="static")
@app.get("/")
async def root():
    return FileResponse("static/index.html")

connections = set()
chat_history = []

@app.get("/history")
async def get_history():
    return chat_history

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            chat_history.append(data)

            # Broadcast
            for conn in list(connections):
                await conn.send_text(data)

    except Exception:
        pass
    finally:
        connections.remove(websocket)
