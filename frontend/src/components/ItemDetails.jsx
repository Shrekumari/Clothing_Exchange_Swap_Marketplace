
import { useEffect, useState } from 'react';

function ItemDetails({ item, user, goBack }) {
  const [myItems, setMyItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/clothing');
        const data = await response.json();

        if (response.ok) {
          const items = data.filter(
            (clothing) =>
              (clothing.owner?._id === user.id ||
                clothing.owner === user.id) &&
              clothing.availability === 'Available'
          );

          setMyItems(items);
        }
      } catch (error) {
        console.error('Failed to fetch your items:', error);
      }
    };

    if (user?.id) {
      fetchMyItems();
    }
  }, [user]);

  // Prioritize same-location items, then closest swap value
  const suggestedItems = [...myItems].sort((a, b) => {
    const requestedLocation = item?.location?.trim().toLowerCase();

    const locationA = a.location?.trim().toLowerCase();
    const locationB = b.location?.trim().toLowerCase();

    const sameLocationA = locationA === requestedLocation;
    const sameLocationB = locationB === requestedLocation;

    if (sameLocationA !== sameLocationB) {
      return sameLocationA ? -1 : 1;
    }

    const differenceA = Math.abs(
      Number(a.swapValue) - Number(item?.swapValue)
    );

    const differenceB = Math.abs(
      Number(b.swapValue) - Number(item?.swapValue)
    );

    return differenceA - differenceB;
  });

  const handleSwapRequest = async () => {
    if (!selectedItem) {
      alert('Please select one of your items to offer.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/swap-requests',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            senderId: user.id,
            requestedItemId: item._id,
            offeredItemId: selectedItem
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Swap request sent successfully!');
        goBack();
      } else {
        alert(data.message || 'Failed to send swap request.');
      }
    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="container py-5 text-center">
        <h4>Item not found</h4>
        <button className="btn btn-outline-success mt-3" onClick={goBack}>
          ← Back to Clothes
        </button>
      </div>
    );
  }

  const isOwnItem =
    item.owner?._id === user?.id || item.owner === user?.id;

  return (
    <div className="container py-5">

      <button
        className="btn btn-outline-success mb-4"
        onClick={goBack}
      >
        ← Back to Clothes
      </button>

      <div className="text-center mb-5">
        <div className="text-success fw-semibold small mb-2">
          CLOTHSWAP MARKETPLACE
        </div>

        <h2 className="fw-bold">Item Details</h2>

        <p className="text-muted">
          View the details of this clothing item.
        </p>
      </div>

      <div
        className="card border-0 shadow-sm mx-auto"
        style={{ maxWidth: '700px' }}
      >
        <div className="card-body p-4">

          {/* Clothing Image */}
          <div className="text-center mb-4">
            {item.image ? (
              <img
                src={`http://localhost:5000${item.image}`}
                alt={item.item}
                className="img-fluid rounded"
               style={{
  width: '100%',
  maxWidth: '350px',
  maxHeight: '350px',
  height: 'auto',
  objectFit: 'contain'
}}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center bg-light rounded mx-auto"
                style={{
                  width: '100%',
                  height: '250px'
                }}
              >
                <span style={{ fontSize: '70px' }}>👕</span>
              </div>
            )}

            <h3 className="fw-bold mt-3">{item.item}</h3>

            <span className="badge bg-success">
              {item.availability}
            </span>
          </div>

          <hr />

          {/* Clothing Information */}
          <div className="row g-3">

            <div className="col-md-6">
              <strong>Clothing Type</strong>
              <p className="text-muted">{item.type}</p>
            </div>

            <div className="col-md-6">
              <strong>Size</strong>
              <p className="text-muted">{item.size}</p>
            </div>

            <div className="col-md-6">
              <strong>Brand</strong>
              <p className="text-muted">{item.brand}</p>
            </div>

            <div className="col-md-6">
              <strong>Condition</strong>
              <p className="text-muted">{item.condition}</p>
            </div>

            <div className="col-md-6">
              <strong>Estimated Swap Value</strong>
              <p className="text-success fw-semibold">
                ₹{item.swapValue}
              </p>
            </div>

            <div className="col-md-6">
              <strong>Location</strong>
              <p className="text-muted">📍 {item.location}</p>
            </div>

          </div>

          <hr className="my-4" />

          {/* Swap Request Section */}
          {isOwnItem ? (
            <div className="alert alert-info">
              This is your own clothing item.
            </div>
          ) : item.availability !== 'Available' ? (
            <div className="alert alert-warning">
              This item is no longer available for swapping.
            </div>
          ) : myItems.length === 0 ? (
            <div className="alert alert-info">
              You need to list your own clothing before sending a swap request.
            </div>
          ) : (
            <>
              <h5 className="fw-bold mb-2">
                Suggested Swaps
              </h5>

              <p className="text-muted small">
                Suggestions prioritize items from the same location
                and then compare estimated swap values.
              </p>

              <label className="form-label fw-semibold">
                Select an item to offer
              </label>

              <select
                className="form-select mb-3"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">Choose your clothing item</option>

                {suggestedItems.map((clothing, index) => {
                  const sameLocation =
                    clothing.location?.trim().toLowerCase() ===
                    item.location?.trim().toLowerCase();

                  const difference = Math.abs(
                    Number(clothing.swapValue) - Number(item.swapValue)
                  );

                  return (
                    <option key={clothing._id} value={clothing._id}>
                      {sameLocation
                        ? '📍 Same Location - '
                        : '🌍 Other Location - '}
                      {index === 0 ? '⭐ Closest Match - ' : ''}
                      {clothing.item} - ₹{clothing.swapValue}
                      {' (Difference: ₹'}
                      {difference}
                      {')'}
                    </option>
                  );
                })}
              </select>

              <button
                className="btn btn-success w-100"
                onClick={handleSwapRequest}
                disabled={loading || !selectedItem}
              >
                {loading ? 'Sending...' : 'Send Swap Request'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
