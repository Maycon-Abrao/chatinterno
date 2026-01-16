from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse("static/index.html")

connections: set[WebSocket] = set()
chat_history: list[dict] = []

@app.get("/history")
async def get_history():
    return chat_history

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.add(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            msg = {
                "user": data.get("user", "Usuário"),
                "message": data.get("message", "")
            }

            chat_history.append(msg)

            for conn in list(connections):
                await conn.send_json(msg)

    except WebSocketDisconnect:
        pass
    finally:
        connections.remove(websocket)
