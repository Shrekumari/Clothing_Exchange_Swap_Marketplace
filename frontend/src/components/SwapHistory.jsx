
import { useEffect, useState } from 'react';

function SwapHistory({ user, goToDashboard }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `http://localhost:5000/api/swap-requests/history/${user.id}`
        );

        const data = await response.json();

        if (response.ok) {
          setHistory(data);
        } else {
          setError(data.message || 'Failed to fetch swap history');
        }
      } catch (error) {
        console.error('History fetch error:', error);
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">

        <button
          className="btn btn-outline-success mb-4"
          onClick={goToDashboard}
        >
          ← Back to Dashboard
        </button>

        <div className="mb-4">
          <h2 className="fw-bold">Swap History</h2>
          <p className="text-muted">
            View your previously accepted clothing exchanges.
          </p>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success"></div>
            <p className="mt-3">Loading swap history...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="text-center py-5">
            <div className="fs-1">🔄</div>

            <h5 className="fw-bold mt-3">
              No swap history yet
            </h5>

            <p className="text-muted">
              Your accepted clothing exchanges will appear here.
            </p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <>
            <p className="text-success fw-semibold">
              {history.length} Accepted Swap(s)
            </p>

            <div className="row g-4">
              {history.map((request) => {
                const senderId = request.sender?._id?.toString();
                const currentUserId = user.id?.toString();

                const isSender = senderId === currentUserId;

                const otherUser = isSender
                  ? request.receiver
                  : request.sender;

                const offeredItem = request.offeredItem;
                const requestedItem = request.requestedItem;

                const itemYouOffered = isSender
                  ? offeredItem
                  : requestedItem;

                const itemYouReceived = isSender
                  ? requestedItem
                  : offeredItem;

                return (
                  <div
                    className="col-md-6 col-lg-4"
                    key={request._id}
                  >
                    <div className="card border-0 shadow-sm h-100">

                      <div className="card-body p-4">

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="fw-bold mb-0">
                            Successful Swap
                          </h5>

                          <span className="badge bg-success">
                            Accepted
                          </span>
                        </div>

                        <p className="text-muted small">
                          Exchanged with: {otherUser?.name || 'User'}
                        </p>

                        <hr />

                        <div className="mb-3">
                          <small className="text-muted">
                            You Offered
                          </small>

                          <h6 className="fw-bold mt-1">
                            {itemYouOffered?.item || 'Item unavailable'}
                          </h6>

                          {itemYouOffered?.image && (
                            <img
                              src={`http://localhost:5000${itemYouOffered.image}`}
                              alt={itemYouOffered.item}
                              className="img-fluid rounded"
                              style={{
                                width: '100%',
                                maxWidth: '150px',
                                maxHeight: '130px',
                                height: 'auto',
                                objectFit: 'contain'
                              }}
                            />
                          )}
                        </div>

                        <div className="text-center text-success fs-4 mb-3">
                          ⇅
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            You Received
                          </small>

                          <h6 className="fw-bold mt-1">
                            {itemYouReceived?.item || 'Item unavailable'}
                          </h6>

                          {itemYouReceived?.image && (
                            <img
                              src={`http://localhost:5000${itemYouReceived.image}`}
                              alt={itemYouReceived.item}
                              className="img-fluid rounded"
                              style={{
                                width: '100%',
                                maxWidth: '150px',
                                maxHeight: '130px',
                                height: 'auto',
                                objectFit: 'contain'
                              }}
                            />
                          )}
                        </div>

                        <hr />

                        <p className="mb-1">
                          <strong>Other User Location:</strong>{' '}
                          {otherUser?.location || 'Not specified'}
                        </p>

                        <p className="text-muted small mb-0">
                          Accepted on:{' '}
                          {new Date(
                            request.updatedAt
                          ).toLocaleDateString()}
                        </p>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default SwapHistory;
