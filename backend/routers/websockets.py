from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json

router = APIRouter(tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        # Store active connections per user_id
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)

manager = ConnectionManager()

@router.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # We just need to keep the connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id)
