from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
            # Broadcast para todos os clientes conectados
            for conn in connections:
                if conn.application_state.value == 1:  # Somente conexões abertas
                    await conn.send_text(data)
    except Exception:
        pass
    finally:
        connections.remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
