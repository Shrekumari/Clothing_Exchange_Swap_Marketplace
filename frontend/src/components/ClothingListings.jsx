
import { useEffect, useState } from 'react';

function ClothingListings({ goToDashboard, viewItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchClothing = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/clothing'
        );

        const data = await response.json();

        if (response.ok) {
          setItems(data);
        } else {
          alert('Failed to load clothing items');
        }
      } catch (error) {
        console.error(error);
        alert('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchClothing();
  }, []);

  // Unique filter options
  const types = [...new Set(items.map(item => item.type).filter(Boolean))];
  const sizes = [...new Set(items.map(item => item.size).filter(Boolean))];
  const brands = [...new Set(items.map(item => item.brand).filter(Boolean))];
  const locations = [...new Set(items.map(item => item.location).filter(Boolean))];

  // Search and filtering
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.item?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      !typeFilter || item.type === typeFilter;

    const matchesSize =
      !sizeFilter || item.size === sizeFilter;

    const matchesBrand =
      !brandFilter || item.brand === brandFilter;

    const matchesLocation =
      !locationFilter || item.location === locationFilter;

    return (
      matchesSearch &&
      matchesType &&
      matchesSize &&
      matchesBrand &&
      matchesLocation
    );
  });

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setSizeFilter('');
    setBrandFilter('');
    setLocationFilter('');
  };

  return (
    <div className="container py-5">

      <button
        className="btn btn-outline-success mb-4"
        onClick={goToDashboard}
      >
        ← Back to Dashboard
      </button>

      <div className="text-center mb-4">
        <h2 className="fw-bold">Browse Clothing</h2>
        <p className="text-muted">
          Discover clothing items available for exchange.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search clothing..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={sizeFilter}
                onChange={e => setSizeFilter(e.target.value)}
              >
                <option value="">All Sizes</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              {filteredItems.length} clothing item(s) found
            </small>

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Clothing Cards */}
      {loading ? (
        <p className="text-center">Loading clothing items...</p>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-5">
          <h5>No clothing items found.</h5>
          <p className="text-muted">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredItems.map(clothing => (
            <div className="col-md-4 col-lg-3" key={clothing._id}>
              <div className="card h-100 border-0 shadow-sm">

                {/* Clothing Image */}
                {clothing.image ? (
                  <div className="bg-light text-center p-2">
                    <img
                      src={`http://localhost:5000${clothing.image}`}
                      alt={clothing.item}
                      className="img-fluid"
                     style={{
  width: '100%',
  maxWidth: '200px',
  maxHeight: '180px',
  height: 'auto',
  objectFit: 'contain'
}}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center bg-light"
                    style={{ height: '220px' }}
                  >
                    <span style={{ fontSize: '55px' }}>👕</span>
                  </div>
                )}

                <div className="card-body">
                  <h5 className="card-title fw-bold">
                    {clothing.item}
                  </h5>

                  <p className="text-muted mb-1">
                    {clothing.type} | Size: {clothing.size}
                  </p>

                  <p className="mb-1">
                    <strong>Brand:</strong> {clothing.brand}
                  </p>

                  <p className="mb-1">
                    <strong>Condition:</strong> {clothing.condition}
                  </p>

                  <p className="mb-1">
                    <strong>Swap Value:</strong> ₹{clothing.swapValue}
                  </p>

                  <p className="mb-2">
                    <strong>Location:</strong> {clothing.location}
                  </p>

                  <span className={`badge ${
                    clothing.availability === 'Available'
                      ? 'bg-success'
                      : 'bg-secondary'
                  }`}>
                    {clothing.availability}
                  </span>

                  <button
                    className="btn btn-success w-100 mt-3"
                    onClick={() => viewItem(clothing)}
                  >
                    View Details
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClothingListings;
