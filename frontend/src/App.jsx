import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [tickets, setTickets] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editedReply, setEditedReply] = useState("");
  const [reviewStatus, setReviewStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsResponse, predictionsResponse] = await Promise.all([
        fetch(`${API_URL}/tickets`),
        fetch(`${API_URL}/predictions`),
      ]);

      const ticketsData = await ticketsResponse.json();
      const predictionsData = await predictionsResponse.json();

      setTickets(ticketsData);
      setPredictions(predictionsData.predictions || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = (ticketId) => {
    return predictions.find((prediction) => prediction.id === ticketId);
  };

  const handleTicketClick = (ticket) => {
    const prediction = getPrediction(ticket.id);

    setSelectedTicket(ticket);
    setEditedReply(prediction?.suggested_reply || "");
  };

  const handleReview = (ticketId, status) => {
    setReviewStatus((previous) => ({
      ...previous,
      [ticketId]: status,
    }));
  };

  const getPriorityClass = (priority) => {
    if (!priority) return "";

    return `priority-${priority.toLowerCase()}`;
  };

  const getCategoryLabel = (category) => {
    if (!category) return "Unknown";

    return category.replace("_", " ");
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading support inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Support Inbox Assistant</h1>
          <p>AI-powered support ticket triage and review</p>
        </div>

        <div className="ticket-count">
          <strong>{tickets.length}</strong>
          <span>Tickets</span>
        </div>
      </header>

      <main className="dashboard">
        <section className="ticket-panel">
          <div className="section-header">
            <div>
              <h2>Review Queue</h2>
              <p>Review AI-generated triage decisions</p>
            </div>
          </div>

          <div className="ticket-list">
            {tickets.map((ticket) => {
              const prediction = getPrediction(ticket.id);
              const status = reviewStatus[ticket.id];

              return (
                <div
                  key={ticket.id}
                  className={`ticket-card ${
                    selectedTicket?.id === ticket.id ? "selected" : ""
                  } ${status ? `reviewed ${status}` : ""}`}
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="ticket-main">
                    <div className="ticket-id">{ticket.id}</div>

                    <div className="ticket-content">
                      <h3>{ticket.subject}</h3>

                      <p className="ticket-preview">
                        {ticket.body}
                      </p>

                      <div className="ticket-meta">
                        {prediction && (
                          <>
                            <span className="category-badge">
                              {getCategoryLabel(prediction.category)}
                            </span>

                            <span
                              className={`priority-badge ${getPriorityClass(
                                prediction.priority
                              )}`}
                            >
                              {prediction.priority}
                            </span>

                            {prediction.escalate && (
                              <span className="escalate-badge">
                                Escalate
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    {status === "approved" && (
                      <span className="status approved">✓ Accepted</span>
                    )}

                    {status === "rejected" && (
                      <span className="status rejected">✕ Rejected</span>
                    )}

                    {!status && (
                      <>
                        <button
                          className="accept-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleReview(ticket.id, "approved");
                          }}
                        >
                          Accept
                        </button>

                        <button
                          className="reject-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleReview(ticket.id, "rejected");
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="details-panel">
          {!selectedTicket ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h2>Select a ticket</h2>
              <p>
                Choose a ticket from the review queue to see its full
                triage analysis.
              </p>
            </div>
          ) : (
            <>
              {(() => {
                const prediction = getPrediction(selectedTicket.id);

                return (
                  <div className="details-content">
                    <div className="details-header">
                      <div>
                        <span className="details-ticket-id">
                          {selectedTicket.id}
                        </span>

                        <h2>{selectedTicket.subject}</h2>
                      </div>

                      <div className="details-status">
                        {reviewStatus[selectedTicket.id] === "approved" && (
                          <span className="status approved">
                            ✓ Accepted
                          </span>
                        )}

                        {reviewStatus[selectedTicket.id] === "rejected" && (
                          <span className="status rejected">
                            ✕ Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="message-box">
                      <h3>Customer Message</h3>
                      <p>{selectedTicket.body}</p>
                    </div>

                    {prediction && (
                      <>
                        <div className="prediction-grid">
                          <div className="prediction-card">
                            <span>Category</span>
                            <strong>
                              {getCategoryLabel(prediction.category)}
                            </strong>
                          </div>

                          <div className="prediction-card">
                            <span>Priority</span>
                            <strong
                              className={getPriorityClass(
                                prediction.priority
                              )}
                            >
                              {prediction.priority}
                            </strong>
                          </div>

                          <div className="prediction-card">
                            <span>Confidence</span>
                            <strong>
                              {Math.round(prediction.confidence * 100)}%
                            </strong>
                          </div>

                          <div className="prediction-card">
                            <span>Escalation</span>
                            <strong>
                              {prediction.escalate ? "Yes" : "No"}
                            </strong>
                          </div>
                        </div>

                        <div className="summary-box">
                          <h3>AI Summary</h3>
                          <p>{prediction.summary}</p>
                        </div>

                        <div className="reply-section">
                          <div className="reply-header">
                            <h3>Suggested Reply</h3>
                            <span>Editable</span>
                          </div>

                          <textarea
                            value={editedReply}
                            onChange={(event) =>
                              setEditedReply(event.target.value)
                            }
                          />
                        </div>

                        <div className="detail-actions">
                          <button
                            className="accept-large"
                            onClick={() =>
                              handleReview(
                                selectedTicket.id,
                                "approved"
                              )
                            }
                          >
                            ✓ Accept Ticket
                          </button>

                          <button
                            className="reject-large"
                            onClick={() =>
                              handleReview(
                                selectedTicket.id,
                                "rejected"
                              )
                            }
                          >
                            ✕ Reject Ticket
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;