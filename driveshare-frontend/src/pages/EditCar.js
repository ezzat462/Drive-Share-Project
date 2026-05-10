import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import carService from "../services/carService";
import { toast } from 'react-toastify';

export default function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    pricePerDay: "",
    location: "",
    description: "",
    imageUrl: "",
    type: 0,
    transmission: 0,
    availableFrom: "",
    availableTo: ""
  });

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const res = await carService.getById(id);
      if (res.success) {
        const car = res.data;
        setForm({
          title: car.title || "",
          brand: car.brand || "",
          model: car.model || "",
          year: car.year || new Date().getFullYear(),
          pricePerDay: car.pricePerDay || "",
          location: car.location || "",
          description: car.description || "",
          imageUrl: car.imageUrl || "",
          type: car.type || 0,
          transmission: car.transmission || 0,
          availableFrom: car.availableFrom ? car.availableFrom.split("T")[0] : "",
          availableTo: car.availableTo ? car.availableTo.split("T")[0] : ""
        });
      } else {
        toast.error(res.message || "Failed to fetch car details");
        navigate("/owner");
      }
    } catch (err) {
      toast.error("Failed to fetch car details");
      navigate("/owner");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type' || name === 'transmission' || name === 'year') {
      setForm({ ...form, [name]: parseInt(value) });
    } else if (name === 'pricePerDay') {
      setForm({ ...form, [name]: parseFloat(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.availableTo) <= new Date(form.availableFrom)) {
      toast.warning("'Available To' date must be after 'Available From' date");
      return;
    }
    try {
      setLoading(true);
      const res = await carService.update(id, form);
      if (res.success) {
        toast.success('Car updated successfully. Waiting for admin re-approval.');
        navigate("/owner");
      } else {
        toast.error(res.message || "Failed to update car");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update car");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="container mt-5 text-center"><h3>Loading...</h3></div>;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow">
            <h2 className="mb-4">Edit Car Listing</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Listing Title</label>
                <input name="title" className="form-control" value={form.title} onChange={handleChange} required />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Brand</label>
                  <input name="brand" className="form-control" value={form.brand} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Model</label>
                  <input name="model" className="form-control" value={form.model} onChange={handleChange} required />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Type</label>
                  <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                    <option value="0">Sedan</option>
                    <option value="1">SUV</option>
                    <option value="2">Truck</option>
                    <option value="3">Coupe</option>
                    <option value="4">Convertible</option>
                    <option value="5">Van</option>
                    <option value="6">Other</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Transmission</label>
                  <select name="transmission" className="form-select" value={form.transmission} onChange={handleChange}>
                    <option value="0">Auto</option>
                    <option value="1">Manual</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Year</label>
                  <input name="year" type="number" className="form-control" value={form.year} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Price / Day</label>
                  <input name="pricePerDay" type="number" className="form-control" value={form.pricePerDay} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input name="location" className="form-control" value={form.location} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" value={form.description} onChange={handleChange} rows="3"></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Image URL</label>
                <input name="imageUrl" className="form-control" value={form.imageUrl} onChange={handleChange} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Available From</label>
                  <input name="availableFrom" type="date" className="form-control" value={form.availableFrom} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label">Available To</label>
                  <input name="availableTo" type="date" className="form-control" value={form.availableTo} onChange={handleChange} required />
                </div>
              </div>
              <div className="d-flex gap-3">
                <button type="submit" className="btn btn-primary px-5 rounded-pill primary-btn" disabled={loading}>
                  {loading ? "Updating..." : "Update Car"}
                </button>
                <button type="button" className="btn btn-outline-secondary px-5 rounded-pill" onClick={() => navigate("/owner")}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
