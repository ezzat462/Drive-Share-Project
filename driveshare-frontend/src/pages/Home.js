import { useState, useEffect } from "react";
import heroBg from '../assets/hero-bg.jpg';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import carService from "../services/carService";
import useFavorites from "../hooks/useFavorites";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchText, setSearchText] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      searchText === "" ||
      car.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchText.toLowerCase()) ||
      car.location?.toLowerCase().includes(searchText.toLowerCase());

    const matchesBrand =
      filterBrand === "" || car.brand?.toLowerCase().includes(filterBrand.toLowerCase());

    const CAR_TYPE_MAP = {
      'Sedan': 0,
      'SUV': 1,
      'Truck': 2,
      'Coupe': 3,
      'Convertible': 4,
      'Van': 5,
      'Other': 6,
    };
    const matchesType =
      filterType === "" || car.type === CAR_TYPE_MAP[filterType];

    const matchesLocation =
      filterLocation === "" || car.location?.toLowerCase().includes(filterLocation.toLowerCase());

    const matchesMin =
      filterMinPrice === "" || car.pricePerDay >= Number(filterMinPrice);

    const matchesMax =
      filterMaxPrice === "" || car.pricePerDay <= Number(filterMaxPrice);

    return matchesSearch && matchesBrand && matchesType && matchesLocation && matchesMin && matchesMax;
  });

  useEffect(() => {
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carService.getAll({ sortOrder });
      if (response.success) {
        setCars(response.data.items || response.data);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      // Dummy data for fallback if service fails
      const dummyCars = [
        { id: 1, brand: "Tesla", model: "Model S", location: "San Francisco", year: 2023, pricePerDay: 150, imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89" },
        { id: 2, brand: "BMW", model: "M4", location: "Los Angeles", year: 2022, pricePerDay: 120, imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e" },
        { id: 3, brand: "Audi", model: "RS6", location: "New York", year: 2023, pricePerDay: 180, imageUrl: "https://images.unsplash.com/photo-1606152424101-ad2f9bc9b8b0" },
      ];
      setCars(dummyCars);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (carId) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate(`/booking/${carId}`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading cars...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-4">
      {/* Hero Section */}
      <div
        className="hero-section rounded-4 shadow-lg mb-5 position-relative overflow-hidden"
        style={{
          minHeight: '420px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background image layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />

        {/* Dark overlay so text stays readable */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(10,20,60,0.82) 0%, rgba(15,40,100,0.70) 50%, rgba(10,20,60,0.55) 100%)',
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div
          className="w-100 text-center px-5 py-5"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <h1
            className="display-4 fw-bold mb-3 mt-2"
            style={{
              color: '#ffffff',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              letterSpacing: '-0.5px',
            }}
          >
            Find Your Perfect Drive
          </h1>

          <p
            className="lead fs-5 mb-4"
            style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
          >
            The ultimate marketplace for peer-to-peer car sharing.
          </p>

          {/* Badges */}
          <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
            <span
              className="px-3 py-2 rounded-pill fw-semibold"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
                fontSize: '0.875rem',
              }}
            >
              Verified Owners
            </span>
            <span
              className="px-3 py-2 rounded-pill fw-semibold"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
                fontSize: '0.875rem',
              }}
            >
              Premium Fleet
            </span>
            <span
              className="px-3 py-2 rounded-pill fw-semibold"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
                fontSize: '0.875rem',
              }}
            >
              24/7 Support
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => document.getElementById('cars-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-lg rounded-pill px-5 py-2 fw-bold"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
              fontSize: '1rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,130,246,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.5)';
            }}
          >
            Browse Cars →
          </button>
        </div>
      </div>

      <div id="cars-section" className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold m-0 border-start border-primary border-4 ps-3">Available for rent</h2>
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Sort Results
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2">
              <li><button className="dropdown-item rounded" onClick={() => setSortOrder("price_asc")}>Price: Low to High</button></li>
              <li><button className="dropdown-item rounded" onClick={() => setSortOrder("price_desc")}>Price: High to Low</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item rounded" onClick={() => setSortOrder("newest")}>Newest First</button></li>
            </ul>
          </div>
        </div>

        {/* Search + Filter Row */}
        <div
          className="p-3 rounded-4 d-flex flex-wrap gap-2 align-items-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Search input */}
          <div className="input-group flex-grow-1" style={{ minWidth: "200px", maxWidth: "300px" }}>
            <span className="input-group-text bg-transparent border-secondary text-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-secondary text-white"
              placeholder="Search brand, model or city..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ color: "white" }}
            />
          </div>

          {/* Car Type dropdown */}
          <select
            className="form-select bg-transparent border-secondary"
            style={{ minWidth: "140px", maxWidth: "160px", color: filterType ? "white" : "#aaa" }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="" style={{ background: "#1a1a2e" }}>All Types</option>
            <option value="Sedan" style={{ background: "#1a1a2e" }}>Sedan</option>
            <option value="SUV" style={{ background: "#1a1a2e" }}>SUV</option>
            <option value="Truck" style={{ background: "#1a1a2e" }}>Truck</option>
            <option value="Coupe" style={{ background: "#1a1a2e" }}>Coupe</option>
            <option value="Convertible" style={{ background: "#1a1a2e" }}>Convertible</option>
            <option value="Van" style={{ background: "#1a1a2e" }}>Van</option>
            <option value="Other" style={{ background: "#1a1a2e" }}>Other</option>
          </select>

          {/* Location input */}
          <input
            type="text"
            className="form-control bg-transparent border-secondary text-white"
            placeholder="📍 Location"
            style={{ minWidth: "130px", maxWidth: "160px" }}
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />

          {/* Min price */}
          <input
            type="number"
            className="form-control bg-transparent border-secondary text-white"
            placeholder="$ Min"
            style={{ minWidth: "90px", maxWidth: "110px" }}
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
          />

          {/* Max price */}
          <input
            type="number"
            className="form-control bg-transparent border-secondary text-white"
            placeholder="$ Max"
            style={{ minWidth: "90px", maxWidth: "110px" }}
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
          />

          {/* Clear filters button — only show if any filter is active */}
          {(searchText || filterBrand || filterType || filterLocation || filterMinPrice || filterMaxPrice) && (
            <button
              className="btn btn-sm btn-outline-danger rounded-pill px-3"
              onClick={() => {
                setSearchText("");
                setFilterBrand("");
                setFilterType("");
                setFilterLocation("");
                setFilterMinPrice("");
                setFilterMaxPrice("");
              }}
            >
              ✕ Clear
            </button>
          )}

          {/* Results count */}
          <span className="ms-auto text-secondary small">
            {filteredCars.length} car{filteredCars.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {filteredCars.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <div className="display-1 mb-3">📭</div>
          <h3 className="text-muted">No cars match your search</h3>
          <p className="text-secondary">Try adjusting the filters or clearing the search.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredCars.map((car) => (
            <div className="col-md-6 col-lg-4" key={car.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden car-hover-card">
                <div className="position-relative">
                  <img
                    src={car.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf"}
                    className="card-img-top"
                    alt={`${car.brand} ${car.model}`}
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        navigate('/login', { state: { from: '/', message: 'Please log in to save favorites!' } });
                        return;
                      }
                      toggleFavorite(car);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'transparent',
                      border: '1.5px solid rgba(255,255,255,0.5)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '18px',
                      transition: 'transform 0.2s ease, background 0.2s ease',
                      zIndex: 10,
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title={isFavorite(car.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <span style={{ color: isFavorite(car.id) ? '#ef4444' : 'white', fontSize: '18px', lineHeight: 1 }}>
                      {isFavorite(car.id) ? '❤' : '♡'}
                    </span>
                  </button>
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-white text-primary fw-bold shadow-sm p-2 rounded-pill px-3">
                      NEW
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="card-title fw-bold mb-1 fs-4">{car.brand} {car.model}</h5>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-geo-alt-fill me-1"></i> {car.location} | {car.year}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="text-primary fw-bold fs-4">${car.pricePerDay}</span>
                      <span className="text-muted small">/day</span>
                    </div>
                  </div>

                  <div className="d-flex mt-3 mb-4 text-muted small gap-3 flex-wrap">
                    <span title="Car Type"><i className="bi bi-tag me-1"></i> {['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Van', 'Other'][car.type || 0]}</span>
                    <span title="Transmission"><i className="bi bi-gear me-1"></i> {car.transmission === 1 ? 'Manual' : 'Auto'}</span>
                    <span title="Location"><i className="bi bi-geo-alt me-1"></i> {car.location}</span>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      onClick={() => handleBookNow(car.id)}
                      className="btn btn-primary rounded-pill py-2 fw-bold shadow-sm"
                    >
                      Book Now
                    </button>
                    <button
                      className="btn btn-light rounded-pill py-2 text-primary border-0"
                      onClick={() => navigate(`/cars/${car.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Styled JSX (Optional if no global CSS is provided) */}
      <style>{`
        .form-control::placeholder {
          color: #888 !important;
        }
        .form-control:focus {
          background: rgba(255,255,255,0.08) !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 0.2rem rgba(59,130,246,0.25) !important;
          color: white !important;
        }
        .form-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 0.2rem rgba(59,130,246,0.25) !important;
        }
        .car-hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .car-hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 1rem 3rem rgba(0,0,0,0.12) !important;
        }
        .hero-section {
          background-size: cover;
          background-position: center;
          transition: box-shadow 0.3s ease;
        }
        .hero-section:hover {
          box-shadow: 0 1.5rem 4rem rgba(0,0,0,0.35) !important;
        }
      `}</style>
      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', background: '#1a1a2e', color: '#fff' }}>
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAuthModal(false)}></button>
              </div>
              <div className="modal-body text-center p-5 pt-2">
                <div className="display-4 mb-4">🔑</div>
                <h3 className="fw-bold mb-3">Authentication Required</h3>
                <p className="text-light opacity-75 mb-4">
                  You must be logged in to the website to rent a car. Join our community to start your journey!
                </p>
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-primary rounded-pill py-2 fw-bold"
                    onClick={() => navigate("/login")}
                    style={{ background: 'linear-gradient(45deg, #6a0dad, #9b30ff)', border: 'none' }}
                  >
                    Log In
                  </button>
                  <button
                    className="btn btn-outline-light rounded-pill py-2 fw-bold"
                    onClick={() => navigate("/register")}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}