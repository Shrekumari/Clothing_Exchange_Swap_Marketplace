import { useEffect, useState } from 'react';

function SwapRequests({ user, goToDashboard }) {
  const [activeTab, setActiveTab] = useState('incoming');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const [incomingResponse, sentResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/swap-requests/incoming/${user.id}`),
        fetch(`http://localhost:5000/api/swap-requests/sent/${user.id}`)
      ]);

      if (!incomingResponse.ok || !sentResponse.ok) {
        throw new Error('Unable to fetch swap requests');
      }

      const incomingData = await incomingResponse.json();
      const sentData = await sentResponse.json();

      setIncomingRequests(incomingData);
      setSentRequests(sentData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Unable to load swap requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user]);

  const updateRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/swap-requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status,
            userId: user.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Unable to update request.');
        return;
      }

      alert(`Request ${status.toLowerCase()} successfully!`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Something went wrong.');
    }
  };

  const requests =
    activeTab === 'incoming' ? incomingRequests : sentRequests;

  if (loading) {
    return <div className="container py-5 text-center">Loading requests...</div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Swap Requests</h2>
        <button className="btn btn-outline-success" onClick={goToDashboard}>
          ← Dashboard
        </button>
      </div>

      <div className="btn-group mb-4">
        <button
          className={`btn ${
            activeTab === 'incoming'
              ? 'btn-success'
              : 'btn-outline-success'
          }`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming ({incomingRequests.length})
        </button>

        <button
          className={`btn ${
            activeTab === 'sent'
              ? 'btn-success'
              : 'btn-outline-success'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="alert alert-light text-center">
          No {activeTab} swap requests found.
        </div>
      ) : (
        <div className="row">
          {requests.map((request) => {
            const otherUser =
              activeTab === 'incoming'
                ? request.sender
                : request.receiver;

            return (
              <div className="col-md-6 mb-4" key={request._id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      {activeTab === 'incoming'
                        ? `Request from ${otherUser?.name || 'User'}`
                        : `Request to ${otherUser?.name || 'User'}`}
                    </h5>

                    <p>
                      <strong>Offered Item:</strong>{' '}
                      {request.offeredItem?.item || 'Unavailable'}
                    </p>

                    <p>
                      <strong>Requested Item:</strong>{' '}
                      {request.requestedItem?.item || 'Unavailable'}
                    </p>

                    <p>
                      <strong>Status:</strong> {request.status}
                    </p>

                    {activeTab === 'incoming' &&
                      request.status === 'Pending' && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              updateRequestStatus(request._id, 'Accepted')
                            }
                          >
                            Accept
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            onClick={() =>
                              updateRequestStatus(request._id, 'Rejected')
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SwapRequests;