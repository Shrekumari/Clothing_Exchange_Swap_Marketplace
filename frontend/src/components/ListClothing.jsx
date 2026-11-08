
import { useEffect, useState } from 'react';

function ListClothing({ user, goToDashboard }) {
  const [formData, setFormData] = useState({
    item: '',
    type: '',
    size: '',
    brand: '',
    condition: '',
    swapValue: '',
    location: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPG, PNG or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5 MB.');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert('Please log in again to list clothing.');
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();

      // Add all form fields only once
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Add owner
      data.append('owner', user.id);

      // Add image if selected
      if (imageFile) {
        data.append('image', imageFile);
      }

      const response = await fetch(
        'http://localhost:5000/api/clothing',
        {
          method: 'POST',
          body: data
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert('Clothing item listed successfully!');

        setFormData({
          item: '',
          type: '',
          size: '',
          brand: '',
          condition: '',
          swapValue: '',
          location: ''
        });

        setImageFile(null);
        setImagePreview('');

        const fileInput = document.getElementById('clothingImage');

        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        console.error('Backend error:', result);

        alert(
          result.error
            ? `${result.message}: ${result.error}`
            : result.message || 'Failed to list clothing item'
        );
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Unable to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">

      {/* Back Button */}
      <div className="mb-4">
        <button
          className="btn btn-outline-success"
          onClick={goToDashboard}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Page Heading */}
      <div className="mb-4 text-center">
        <div className="text-success fw-semibold small mb-2">
          CLOTHSWAP MARKETPLACE
        </div>

        <h2 className="fw-bold">
          List Your Clothing
        </h2>

        <p className="text-muted">
          Add an item you would like to exchange with another user.
        </p>
      </div>

      {/* Clothing Form */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            {/* Item Name */}
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold d-block">
                Item Name
              </label>

              <input
                type="text"
                name="item"
                className="form-control"
                placeholder="e.g. Denim Jacket"
                value={formData.item}
                onChange={handleChange}
                required
              />
            </div>

            {/* Clothing Type */}
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold d-block">
                Clothing Type
              </label>

              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="Shirt">Shirt</option>
                <option value="T-Shirt">T-Shirt</option>
                <option value="Jacket">Jacket</option>
                <option value="Dress">Dress</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
                <option value="Skirt">Skirt</option>
                <option value="Sweater">Sweater</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Size */}
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold d-block">
                Size
              </label>

              <select
                name="size"
                className="form-select"
                value={formData.size}
                onChange={handleChange}
                required
              >
                <option value="">Select size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            {/* Brand */}
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold d-block">
                Brand
              </label>

              <input
                type="text"
                name="brand"
                className="form-control"
                placeholder="e.g. Levis"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>

            {/* Condition */}
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold d-block">
                Condition
              </label>

              <select
                name="condition"
                className="form-select"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="">Select condition</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {/* Swap Value */}
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold d-block">
                Estimated Swap Value (₹)
              </label>

              <input
                type="number"
                name="swapValue"
                className="form-control"
                placeholder="e.g. 1200"
                min="0"
                value={formData.swapValue}
                onChange={handleChange}
                required
              />
            </div>

            {/* Location */}
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold d-block">
                Location
              </label>

              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="e.g. Udupi"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Clothing Image */}
            <div className="mb-4 text-start">
              <label className="form-label fw-semibold d-block">
                Clothing Image (Optional)
              </label>

              <input
                type="file"
                id="clothingImage"
                className="form-control"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              <small className="text-muted">
                JPG, PNG or WEBP. Maximum size: 5 MB.
              </small>

              {imagePreview && (
                <div className="mt-3">
                  <p className="fw-semibold mb-2">
                    Image Preview
                  </p>

                  <img
                    src={imagePreview}
                    alt="Clothing preview"
                    className="img-thumbnail"
                    style={{
                      width: '220px',
                      height: '220px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-start">
              <button
                type="submit"
                className="btn btn-success px-4"
                disabled={submitting}
              >
                {submitting ? 'Listing...' : 'List Clothing'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ListClothing;
