
import { useEffect, useState } from 'react';

function MyListings({ user, goToDashboard }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FETCH MY LISTINGS
  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `http://localhost:5000/api/clothing/my-listings/${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setItems(data);
      } else {
        setError(data.message || 'Failed to fetch listings');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyListings();
    }
  }, [user?.id]);

  // DELETE LISTING
  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this listing?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/clothing/${itemId}/${user.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Listing deleted successfully!');

        setItems((previousItems) =>
          previousItems.filter((item) => item._id !== itemId)
        );
      } else {
        alert(data.message || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Unable to connect to server');
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-success"></div>
        <p className="mt-3">Loading your listings...</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">

        {/* BACK BUTTON */}
        <button
          className="btn btn-outline-success mb-4"
          onClick={goToDashboard}
        >
          ← Back to Dashboard
        </button>

        {/* PAGE HEADING */}
        <h2 className="fw-bold">My Listings</h2>

        <p className="text-muted mb-4">
          Manage the clothing items you have listed.
        </p>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger">
            {error}
            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={fetchMyListings}
            >
              Try Again
            </button>
          </div>
        )}

        {/* LISTINGS */}
        <div className="row g-4">

          {items.map((item) => (
            <div className="col-md-6 col-lg-4" key={item._id}>

              <div className="card border-0 shadow-sm h-100">

                {/* CLOTHING IMAGE */}
                {item.image ? (
                  <div className="bg-white text-center p-3">
                    <img
                      src={`http://localhost:5000${item.image}`}
                      alt={item.item}
                      className="img-fluid rounded"
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        maxHeight: '180px',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center bg-white"
                    style={{ height: '150px' }}
                  >
                    <span className="fs-1">👕</span>
                  </div>
                )}

                <div className="card-body p-4">

                  <h5 className="fw-bold">
                    {item.item}
                  </h5>

                  <p>
                    <strong>Type:</strong> {item.type}
                  </p>

                  <p>
                    <strong>Size:</strong> {item.size}
                  </p>

                  <p>
                    <strong>Brand:</strong> {item.brand || 'Not specified'}
                  </p>

                  <p>
                    <strong>Condition:</strong> {item.condition}
                  </p>

                  <p>
                    <strong>Swap Value:</strong> ₹{item.swapValue}
                  </p>

                  <p>
                    <strong>Location:</strong> {item.location}
                  </p>

                  <span
                    className={`badge ${
                      item.availability === 'Swapped'
                        ? 'bg-secondary'
                        : 'bg-success'
                    }`}
                  >
                    {item.availability}
                  </span>

                  <button
                    className="btn btn-outline-danger w-100 mt-3"
                    onClick={() => handleDelete(item._id)}
                    disabled={item.availability === 'Swapped'}
                  >
                    Delete Listing
                  </button>

                </div>
              </div>

            </div>
          ))}

        </div>

        {/* EMPTY STATE */}
        {!error && items.length === 0 && (
          <div className="text-center py-5">
            <div className="fs-1">👕</div>

            <h5 className="fw-bold mt-3">
              No listings yet
            </h5>

            <p className="text-muted">
              Start by listing your first clothing item.
            </p>

            <button
              className="btn btn-success mt-2"
              onClick={goToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyListings;
