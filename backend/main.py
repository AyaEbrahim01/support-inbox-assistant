from fastapi import FastAPI, HTTPException
from backend.data import load_tickets
from backend.llm import triage_ticket
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Support Inbox Assistant",
    description="AI assistant for customer support requests",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Support Inbox Assistant is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/tickets")
def get_tickets():
    return load_tickets()


@app.post("/tickets/{ticket_id}/triage")
def triage(ticket_id: str):
    tickets = load_tickets()

    ticket = next(
        (ticket for ticket in tickets if ticket["id"] == ticket_id),
        None
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    result = triage_ticket(ticket)

    return {
        "id": ticket_id,
        **result.model_dump()
    }