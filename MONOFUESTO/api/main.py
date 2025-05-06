from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Set
import uuid
import json
import sqlite3
import os
from datetime import datetime
import asyncio

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DB_PATH = "monofuesto.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create games table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS games (
        code TEXT PRIMARY KEY,
        banker_name TEXT NOT NULL,
        bank_balance REAL NOT NULL,
        created_at TEXT NOT NULL,
        game_mode TEXT DEFAULT 'traditional'
    )
    ''')
    
    # Create players table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        game_code TEXT NOT NULL,
        name TEXT NOT NULL,
        balance REAL NOT NULL,
        joined_at TEXT NOT NULL,
        FOREIGN KEY (game_code) REFERENCES games (code)
    )
    ''')
    
    # Create transactions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        game_code TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        player_id TEXT,
        from_entity TEXT,
        to_entity TEXT,
        description TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (game_code) REFERENCES games (code),
        FOREIGN KEY (player_id) REFERENCES players (id)
    )
    ''')
    
    # Create transfer_requests table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transfer_requests (
        id TEXT PRIMARY KEY,
        game_code TEXT NOT NULL,
        player_id TEXT NOT NULL,
        amount REAL NOT NULL,
        reason TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (game_code) REFERENCES games (code),
        FOREIGN KEY (player_id) REFERENCES players (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        # Map of game_code -> set of WebSocket connections
        self.game_connections: Dict[str, Set[WebSocket]] = {}
        # Map of WebSocket -> (game_code, role, id)
        self.active_connections: Dict[WebSocket, tuple] = {}
    
    async def connect(self, websocket: WebSocket, game_code: str):
        await websocket.accept()
        if game_code not in self.game_connections:
            self.game_connections[game_code] = set()
        self.game_connections[game_code].add(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            game_code, _, _ = self.active_connections[websocket]
            if game_code in self.game_connections:
                self.game_connections[game_code].remove(websocket)
                if not self.game_connections[game_code]:
                    del self.game_connections[game_code]
            del self.active_connections[websocket]
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str, game_code: str, exclude: WebSocket = None):
        if game_code in self.game_connections:
            for connection in self.game_connections[game_code]:
                if connection != exclude:
                    await connection.send_text(message)
    
    def set_connection_info(self, websocket: WebSocket, game_code: str, role: str, entity_id: str):
        self.active_connections[websocket] = (game_code, role, entity_id)
    
    def get_connection_info(self, websocket: WebSocket):
        return self.active_connections.get(websocket)

manager = ConnectionManager()

# Models
class GameCreate(BaseModel):
    banker_name: str

class GameJoin(BaseModel):
    player_name: str
    game_code: str

class BankerJoin(BaseModel):
    banker_name: str
    game_code: str

class TransferRequest(BaseModel):
    player_id: str
    amount: float
    reason: Optional[str] = None

# API Routes
@app.post("/api/create-game")
async def create_game(game: GameCreate, conn = Depends(get_db)):
    cursor = conn.cursor()
    
    # Generate a unique 6-character game code
    game_code = ''.join(str(uuid.uuid4())[:6]).upper()
    
    # Create a new game
    cursor.execute(
        "INSERT INTO games (code, banker_name, bank_balance, created_at) VALUES (?, ?, ?, ?)",
        (game_code, game.banker_name, 10000, datetime.now().isoformat())
    )
    conn.commit()
    
    return {"gameCode": game_code}

@app.post("/api/join-game")
async def join_game(join_data: GameJoin, conn = Depends(get_db)):
    cursor = conn.cursor()
    
    # Check if game exists
    cursor.execute("SELECT * FROM games WHERE code = ?", (join_data.game_code,))
    game = cursor.fetchone()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Generate a unique player ID
    player_id = str(uuid.uuid4())
    
    # Add player to the game
    cursor.execute(
        "INSERT INTO players (id, game_code, name, balance, joined_at) VALUES (?, ?, ?, ?, ?)",
        (player_id, join_data.game_code, join_data.player_name, 1500, datetime.now().isoformat())
    )
    conn.commit()
    
    return {"playerId": player_id}

@app.post("/api/join-as-banker")
async def join_as_banker(join_data: BankerJoin, conn = Depends(get_db)):
    cursor = conn.cursor()
    
    # Check if game exists
    cursor.execute("SELECT * FROM games WHERE code = ?", (join_data.game_code,))
    game = cursor.fetchone()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Update banker name if different
    if game["banker_name"] != join_data.banker_name:
        cursor.execute(
            "UPDATE games SET banker_name = ? WHERE code = ?",
            (join_data.banker_name, join_data.game_code)
        )
        conn.commit()
    
    return {"success": True}

@app.get("/api/player-data")
async def get_player_data(player_id: str = Query(...), game_code: str = Query(...), conn = Depends(get_db)):
    cursor = conn.cursor()
    
    # Get player data
    cursor.execute("SELECT * FROM players WHERE id = ? AND game_code = ?", (player_id, game_code))
    player = cursor.fetchone()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get player's transactions
    cursor.execute(
        """
        SELECT * FROM transactions 
        WHERE game_code = ? AND (player_id = ? OR from_entity = ? OR to_entity = ?)
        ORDER BY timestamp DESC
        """, 
        (game_code, player_id, player["name"], player["name"])
    )
    transactions = cursor.fetchall()
    
    # Convert to list of dicts
    transactions_list = []
    for t in transactions:
        transactions_list.append({
            "id": t["id"],
            "type": t["type"],
            "amount": t["amount"],
            "from": t["from_entity"],
            "to": t["to_entity"],
            "description": t["description"],
            "timestamp": t["timestamp"]
        })
    
    return {
        "balance": player["balance"],
        "transactions": transactions_list
    }

@app.get("/api/game-data")
async def get_game_data(game_code: str = Query(...), conn = Depends(get_db)):
    cursor = conn.cursor()
    
    # Get game data
    cursor.execute("SELECT * FROM games WHERE code = ?", (game_code,))
    game = cursor.fetchone()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get all players in the game
    cursor.execute("SELECT * FROM players WHERE game_code = ?", (game_code,))
    players = cursor.fetchall()
    
    # Get all transactions in the game
    cursor.execute("SELECT * FROM transactions WHERE game_code = ? ORDER BY timestamp DESC", (game_code,))
    transactions = cursor.fetchall()
    
    # Get all transfer requests in the game
    cursor.execute("SELECT * FROM transfer_requests WHERE game_code = ? ORDER BY timestamp DESC", (game_code,))
    transfer_requests = cursor.fetchall()
    
    # Convert to lists of dicts
    players_list = []
    for p in players:
        players_list.append({
            "id": p["id"],
            "name": p["name"],
            "balance": p["balance"],
            "joinedAt": p["joined_at"]
        })
    
    transactions_list = []
    for t in transactions:
        transactions_list.append({
            "id": t["id"],
            "type": t["type"],
            "amount": t["amount"],
            "from": t["from_entity"],
            "to": t["to_entity"],
            "description": t["description"],
            "timestamp": t["timestamp"]
        })
    
    requests_list = []
    for r in transfer_requests:
        # Get player name
        cursor.execute("SELECT name FROM players WHERE id = ?", (r["player_id"],))
        player = cursor.fetchone()
        player_name = player["name"] if player else "Unknown"
        
        requests_list.append({
            "requestId": r["id"],
            "playerId": r["player_id"],
            "playerName": player_name,
            "amount": r["amount"],
            "reason": r["reason"],
            "timestamp": r["timestamp"]
        })
    
    return {
        "bankBalance": game["bank_balance"],
        "players": players_list,
        "transactions": transactions_list,
        "transferRequests": requests_list
    }

# WebSocket endpoint
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket, game_code: str = Query(...)):
    await manager.connect(websocket, game_code)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Process message based on type
            if message["type"] == "authenticate":
                role = message.get("role")
                if role == "player":
                    player_id = message.get("playerId")
                    manager.set_connection_info(websocket, game_code, "player", player_id)
                elif role == "banker":
                    manager.set_connection_info(websocket, game_code, "banker", "banker")
            
            elif message["type"] == "transfer":
                await handle_transfer(message, game_code)
            
            elif message["type"] == "bank_operation":
                await handle_bank_operation(message, game_code)
            
            elif message["type"] == "adjust_balance":
                await handle_adjust_balance(message, game_code)
            
            elif message["type"] == "transfer_request":
                await handle_transfer_request(message, game_code)
            
            elif message["type"] == "approve_transfer_request":
                await handle_approve_transfer_request(message, game_code)
            
            elif message["type"] == "reject_transfer_request":
                await handle_reject_transfer_request(message, game_code)
            
            # Broadcast the message to all clients in the game
            await manager.broadcast(data, game_code, exclude=None)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# WebSocket message handlers
async def handle_transfer(message, game_code):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        player_id = message["playerId"]
        amount = message["amount"]
        source = message["source"]
        
        # Get player
        cursor.execute("SELECT * FROM players WHERE id = ? AND game_code = ?", (player_id, game_code))
        player = cursor.fetchone()
        if not player:
            return
        
        # Get game
        cursor.execute("SELECT * FROM games WHERE code = ?", (game_code,))
        game = cursor.fetchone()
        if not game:
            return
        
        # Update balances
        if source == "bank":
            # Transfer from bank to player
            new_bank_balance = game["bank_balance"] - amount
            new_player_balance = player["balance"] + amount
            
            cursor.execute("UPDATE games SET bank_balance = ? WHERE code = ?", (new_bank_balance, game_code))
            cursor.execute("UPDATE players SET balance = ? WHERE id = ?", (new_player_balance, player_id))
            
            # Add transaction
            transaction_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO transactions 
                (id, game_code, type, amount, player_id, from_entity, to_entity, description, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    transaction_id, 
                    game_code, 
                    "deposit", 
                    amount, 
                    player_id, 
                    "Bank", 
                    player["name"], 
                    "Transfer from bank", 
                    datetime.now().isoformat()
                )
            )
        else:
            # Transfer from player to bank
            new_bank_balance = game["bank_balance"] + amount
            new_player_balance = player["balance"] - amount
            
            cursor.execute("UPDATE games SET bank_balance = ? WHERE code = ?", (new_bank_balance, game_code))
            cursor.execute("UPDATE players SET balance = ? WHERE id = ?", (new_player_balance, player_id))
            
            # Add transaction
            transaction_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO transactions 
                (id, game_code, type, amount, player_id, from_entity, to_entity, description, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    transaction_id, 
                    game_code, 
                    "withdrawal", 
                    amount, 
                    player_id, 
                    player["name"], 
                    "Bank", 
                    "Transfer to bank", 
                    datetime.now().isoformat()
                )
            )
        
        conn.commit()
        
        # Broadcast updates
        await manager.broadcast(
            json.dumps({
                "type": "balance_update",
                "gameCode": game_code,
                "playerId": player_id,
                "newBalance": new_player_balance
            }),
            game_code
        )
        
        await manager.  new_player_balance
            }),
            game_code
        )
        
        await manager.broadcast(
            json.dumps({
                "type": "bank_balance_update",
                "gameCode": game_code,
                "newBalance": new_bank_balance
            }),
            game_code
        )
        
    except Exception as e:
        print(f"Error handling transfer: {e}")
    finally:
        conn.close()

async def handle_bank_operation(message, game_code):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        operation = message["operation"]
        amount = message["amount"]
        
        # Get game
        cursor.execute("SELECT * FROM games WHERE code = ?", (game_code,))
        game = cursor.fetchone()
        if not game:
            return
        
        # Update bank balance
        new_balance = game["bank_balance"]
        if operation == "add":
            new_balance += amount
        elif operation == "remove":
            new_balance -= amount
        
        cursor.execute("UPDATE games SET bank_balance = ? WHERE code = ?", (new_balance, game_code))
        conn.commit()
        
        # Broadcast update
        await manager.broadcast(
            json.dumps({
                "type": "bank_balance_update",
                "gameCode": game_code,
                "newBalance": new_balance
            }),
            game_code
        )
        
    except Exception as e:
        print(f"Error handling bank operation: {e}")
    finally:
        conn.close()

async def handle_adjust_balance(message, game_code):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        player_id = message["playerId"]
        amount = message["amount"]
        
        # Get player
        cursor.execute("SELECT * FROM players WHERE id = ? AND game_code = ?", (player_id, game_code))
        player = cursor.fetchone()
        if not player:
            return
        
        # Update player balance
        new_balance = player["balance"] + amount
        cursor.execute("UPDATE players SET balance = ? WHERE id = ?", (new_balance, player_id))
        
        # Add transaction
        transaction_id = str(uuid.uuid4())
        if amount > 0:
            transaction_type = "deposit"
            from_entity = "Bank"
            to_entity = player["name"]
        else:
            transaction_type = "withdrawal"
            from_entity = player["name"]
            to_entity = "Bank"
        
        cursor.execute(
            """
            INSERT INTO transactions 
            (id, game_code, type, amount, player_id, from_entity, to_entity, description, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                transaction_id, 
                game_code, 
                transaction_type, 
                abs(amount), 
                player_id, 
                from_entity, 
                to_entity, 
                "Balance adjustment", 
                datetime.now().isoformat()
            )
        )
        
        conn.commit()
        
        # Broadcast updates
        await manager.broadcast(
            json.dumps({
                "type": "balance_update",
                "gameCode": game_code,
                "playerId": player_id,
                "newBalance": new_balance
            }),
            game_code
        )
        
        await manager.broadcast(
            json.dumps({
                "type": "transaction",
                "gameCode": game_code,
                "playerId": player_id,
                "transaction": {
                    "id": transaction_id,
                    "type": transaction_type,
                    "amount": abs(amount),
                    "from": from_entity,
                    "to": to_entity,
                    "description": "Balance adjustment",
                    "timestamp": datetime.now().isoformat()
                }
            }),
            game_code
        )
        
    except Exception as e:
        print(f"Error handling adjust balance: {e}")
    finally:
        conn.close()

async def handle_transfer_request(message, game_code):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        player_id = message["playerId"]
        amount = message["amount"]
        reason = message.get("reason", "")
        
        # Get player
        cursor.execute("SELECT * FROM players WHERE id = ? AND game_code = ?", (player_id, game_code))
        player = cursor.fetchone()
        if not player:
            return
        
        # Add transfer request
        request_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO transfer_requests 
            (id, game_code, player_id, amount, reason, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                request_id, 
                game_code, 
                player_id, 
                amount, 
                reason, 
                datetime.now().isoformat()
            )
        )
        
        conn.commit()
        
        # Broadcast request
        await manager.broadcast(
            json.dumps({
                "type": "transfer_request",
                "requestId": request_id,
                "gameCode": game_code,
                "playerId": player_id,
                "playerName": player["name"],
                "amount": amount,
                "reason": reason,
                "timestamp": datetime.now().isoformat()
            }),
            game_code
        )
        
    except Exception as e:
        print(f"Error handling transfer request: {e}")
    finally:
        conn.close()

async def handle_approve_transfer_request(message, game_code):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        request_id = message["requestId"]
        player_id = message["playerId"]
        amount = message["amount"]
        
        # Get player
        cursor.execute("SELECT * FROM players WHERE id = ? AND game_code = ?", (player_id, game_code))
        player = cursor.fetchone()
        if not player:
            return
        
        # Get game
        cursor.execute("SELECT * FROM games WHERE code = ?", (game_code,))
        game = cursor.fetchone()
        if not game:
            return
        
        # Update balances
        new_bank_balance = game["bank_balance"] - amount
        new_player_balance = player["balance"] + amount
        
        cursor.execute("UPDATE games SET bank_balance = ? WHERE code = ?", (new_bank_balance, game_code))
        cursor.execute("UPDATE players SET balance = ? WHERE id = ?", (new_player_balance, player_id))
        
        # Add transaction
        transaction_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO transactions 
            (id, game_code, type, amount, player_id, from_entity, to_entity, description, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                transaction_id, 
                game_code, 
                "deposit", 
                amount, 
                player_id, 
                "Bank", 
                player["name"], 
                "Approved transfer request", 
                datetime.now().isoformat()
            )
        )
        
        # Remove transfer request
        cursor.execute("DELETE FROM transfer_requests WHERE id = ?", (request_id,))
        
        conn.commit()
        
        # Broadcast updates
        await manager.broadcast(
            json.dumps({
                "type": "balance_update",
                "gameCode": game_code,
                "playerId": player_id,
                "newBalance": new_player_balance
            }),
            game_code
        )
        
        await manager.broadcast(
            json.dumps({
                "type": "bank_balance_update",
                "gameCode": game_code,
                "newBalance": new_bank_balance
            }),
            game_code
        )
        
        await manager.broadcast(
            json.dumps({
                "type": "transaction",
                "gameCode": game_code,
                "playerId": player_id,
                "transaction": {
                    "id": transaction_id,
                    "type": "deposit",
                    "amount": amount,
                    "from": "Bank",
                    "to": player["name"],
                    "description": "Approved transfer request",
                    "timestamp": datetime.now().isoformat()
                }
            }),
            game_code
        )
        
    except Exception as e:
        print(f"Error handling approve transfer request: {e}")
    finally:
        conn.close()

async def handle_reject_transfer_request(message, game_code):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        request_id = message["requestId"]
        
        # Remove transfer request
        cursor.execute("DELETE FROM transfer_requests WHERE id = ?", (request_id,))
        conn.commit()
        
    except Exception as e:
        print(f"Error handling reject transfer request: {e}")
    finally:
        conn.close()

# Run the FastAPI app with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5328)
