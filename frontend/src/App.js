import React, { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [products, setProducts] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [productForm, setProductForm] = useState({ name:'', category:'', price:'', quantity:'', description:'' });
  const [buyerForm, setBuyerForm] = useState({ name:'', email:'', phone:'', address:'' });
  const [message, setMessage] = useState(null);
  const API = "http://localhost:4000/api";

  const fetchData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([axios.get(`${API}/products`), axios.get(`${API}/buyers`)]);
      setProducts(pRes.data);
      setBuyers(bRes.data);
    } catch (err) {
      console.error(err);
      setMessage({ type:'danger', text: 'Could not fetch data from server.' });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const clearMessage = () => { setTimeout(()=>setMessage(null), 3000); };

  const addProduct = async () => {
    // validation
    if(!productForm.name || productForm.price === '') {
      setMessage({ type:'danger', text:'Product name and price are required.' }); clearMessage(); return;
    }
    if(isNaN(productForm.price) || Number(productForm.price) < 0){
      setMessage({ type:'danger', text:'Price must be a non-negative number.' }); clearMessage(); return;
    }
    if(productForm.quantity !== '' && (isNaN(productForm.quantity) || Number(productForm.quantity) < 0)){
      setMessage({ type:'danger', text:'Quantity must be a non-negative number.' }); clearMessage(); return;
    }

    try{
      await axios.post(`${API}/products`, productForm);
      setProductForm({ name:'', category:'', price:'', quantity:'', description:'' });
      setMessage({ type:'success', text:'Product added.' }); clearMessage();
      fetchData();
    }catch(err){
      setMessage({ type:'danger', text: err?.response?.data?.error || 'Could not add product.' }); clearMessage();
    }
  };

  const addBuyer = async () => {
    if(!buyerForm.name || !buyerForm.email){
      setMessage({ type:'danger', text:'Buyer name and email are required.' }); clearMessage(); return;
    }
    // basic email check
    if(!/^\S+@\S+\.\S+$/.test(buyerForm.email)){
      setMessage({ type:'danger', text:'Invalid email format.' }); clearMessage(); return;
    }
    try{
      await axios.post(`${API}/buyers`, buyerForm);
      setBuyerForm({ name:'', email:'', phone:'', address:'' });
      setMessage({ type:'success', text:'Buyer added.' }); clearMessage();
      fetchData();
    }catch(err){
      setMessage({ type:'danger', text: err?.response?.data?.error || 'Could not add buyer.' }); clearMessage();
    }
  };

  const confirmAndDelete = async (type, id) => {
    const ok = window.confirm('Are you sure you want to delete this record?');
    if(!ok) return;
    try{
      await axios.delete(`${API}/${type}s/${id}`);
      setMessage({ type:'success', text: `${type} deleted.` }); clearMessage();
      fetchData();
    }catch(err){
      setMessage({ type:'danger', text: err?.response?.data?.error || 'Delete failed.' }); clearMessage();
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Products & Buyers — Admin</h1>

      {message && (
        <div className={`alert alert-${message.type}`} role="alert">{message.text}</div>
      )}

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Add Product</h5>
            <input className="form-control mb-2" placeholder="Name" value={productForm.name}
              onChange={(e)=>setProductForm({...productForm, name:e.target.value})} />
            <input className="form-control mb-2" placeholder="Category" value={productForm.category}
              onChange={(e)=>setProductForm({...productForm, category:e.target.value})} />
            <input type="number" className="form-control mb-2" placeholder="Price" value={productForm.price}
              onChange={(e)=>setProductForm({...productForm, price:e.target.value})} min="0" />
            <input type="number" className="form-control mb-2" placeholder="Quantity" value={productForm.quantity}
              onChange={(e)=>setProductForm({...productForm, quantity:e.target.value})} min="0" />
            <textarea className="form-control mb-2" placeholder="Description" value={productForm.description}
              onChange={(e)=>setProductForm({...productForm, description:e.target.value})} />
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={addProduct}>Add Product</button>
              <button className="btn btn-secondary" onClick={()=>setProductForm({ name:'', category:'', price:'', quantity:'', description:'' })}>Reset</button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Add Buyer</h5>
            <input className="form-control mb-2" placeholder="Name" value={buyerForm.name}
              onChange={(e)=>setBuyerForm({...buyerForm, name:e.target.value})} />
            <input type="email" className="form-control mb-2" placeholder="Email" value={buyerForm.email}
              onChange={(e)=>setBuyerForm({...buyerForm, email:e.target.value})} />
            <input className="form-control mb-2" placeholder="Phone" value={buyerForm.phone}
              onChange={(e)=>setBuyerForm({...buyerForm, phone:e.target.value})} />
            <input className="form-control mb-2" placeholder="Address" value={buyerForm.address}
              onChange={(e)=>setBuyerForm({...buyerForm, address:e.target.value})} />
            <div className="d-flex gap-2">
              <button className="btn btn-success" onClick={addBuyer}>Add Buyer</button>
              <button className="btn btn-secondary" onClick={()=>setBuyerForm({ name:'', email:'', phone:'', address:'' })}>Reset</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <h4>Products</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Quantity</th><th>Description</th><th>Created</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="8" className="text-center">No products</td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.price}</td>
                    <td>{p.quantity}</td>
                    <td>{p.description}</td>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={()=>confirmAndDelete('product', p.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-12 mt-3">
          <h4>Buyers</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Created</th><th>Action</th></tr>
              </thead>
              <tbody>
                {buyers.length === 0 ? (
                  <tr><td colSpan="7" className="text-center">No buyers</td></tr>
                ) : buyers.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.name}</td>
                    <td>{b.email}</td>
                    <td>{b.phone}</td>
                    <td>{b.address}</td>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={()=>confirmAndDelete('buyer', b.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
