
import { useEffect, useState } from 'react';

function IncomingRequests({ user, goToDashboard }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchRequests = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/swap-requests/incoming/${user.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch requests');
            }

            setRequests(data);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchRequests();
        }
    }, [user]);

    const handleRequest = async (requestId, status) => {
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
                throw new Error(data.message || 'Unable to update request');
            }

            setMessage(data.message || `Request ${status.toLowerCase()} successfully.`);
            fetchRequests();
        } catch (error) {
            setMessage(error.message);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <p>Loading incoming requests...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <button
                className="btn btn-outline-success mb-4"
                onClick={goToDashboard}
            >
                ← Back to Dashboard
            </button>

            <h2 className="mb-4">Incoming Swap Requests</h2>

            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            {requests.length === 0 ? (
                <div className="alert alert-light border">
                    You have not received any swap requests yet.
                </div>
            ) : (
                <div className="row">
                    {requests.map((request) => (
                        <div className="col-md-6 mb-4" key={request._id}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        Request from {request.sender?.name || 'Unknown User'}
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
                                        <strong>Status:</strong>{' '}
                                        {request.status}
                                    </p>

                                    {request.status === 'Pending' && (
                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                className="btn btn-success"
                                                onClick={() =>
                                                    handleRequest(request._id, 'Accepted')
                                                }
                                            >
                                                Accept
                                            </button>

                                            <button
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    handleRequest(request._id, 'Rejected')
                                                }
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default IncomingRequests;
