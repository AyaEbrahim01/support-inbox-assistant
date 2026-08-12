import { useEffect, useState } from "react";

function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editedReply, setEditedReply] = useState("");
  const [reviewStatus, setReviewStatus] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/tickets")
      .then((response) => response.json())
      .then((data) => {
        setTickets(data);
      })
      .catch((error) => {
        console.error("Failed to load tickets:", error);
      });
  }, []);

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
    setTriage(null);
    setEditedReply("");
    setReviewStatus(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tickets/${ticket.id}/triage`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      setTriage(data);
      setEditedReply(data.suggested_reply);
      setReviewStatus(null);
    } catch (error) {
      console.error("Failed to triage ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setReviewStatus("approved");
  };

  const handleReject = () => {
    setReviewStatus("rejected");
  };

  return (
    <div>
      <h1>Support Inbox Assistant</h1>

      <div>
        <h2>Tickets</h2>

        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => handleTicketClick(ticket)}
          >
            {ticket.id} — {ticket.subject}
          </button>
        ))}
      </div>

      <div>
        <h2>Triage</h2>

        {!selectedTicket && <p>Select a ticket.</p>}

        {selectedTicket && (
          <div>
            <h3>{selectedTicket.subject}</h3>

            <p>{selectedTicket.body}</p>

            {loading && <p>Analyzing ticket...</p>}

            {triage && (
              <div>
                <p>
                  <strong>Category:</strong> {triage.category}
                </p>

                <p>
                  <strong>Priority:</strong> {triage.priority}
                </p>

                <p>
                  <strong>Summary:</strong> {triage.summary}
                </p>

                <p>
                  <strong>Confidence:</strong>{" "}
                  {triage.confidence}
                </p>

                <p>
                  <strong>Escalate:</strong>{" "}
                  {triage.escalate ? "Yes" : "No"}
                </p>

                <h3>Suggested Reply</h3>

                <textarea
                  rows="6"
                  cols="70"
                  value={editedReply}
                  onChange={(event) =>
                    setEditedReply(event.target.value)
                  }
                />

                <div>
                  <button onClick={handleApprove}>
                    Approve
                  </button>

                  <button onClick={handleReject}>
                    Reject
                  </button>
                </div>

                {reviewStatus === "approved" && (
                  <p>✓ Ticket approved</p>
                )}

                {reviewStatus === "rejected" && (
                  <p>✕ Ticket rejected</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;