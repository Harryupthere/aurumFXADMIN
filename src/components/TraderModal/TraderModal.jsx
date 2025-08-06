import React, { useState, useEffect } from 'react';
import './TraderModal.scss';

const TraderModal = ({ isOpen, onClose, onSubmit, trader, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    account_balance: '',
    growth_percentage: '',
    platform: 'MetaTrader 4',
    rank_id: ''
  });

  useEffect(() => {
    if (trader && mode === 'edit') {
      setFormData({
        name: trader.name,
        account_balance: trader.account_balance.toString(),
        growth_percentage: trader.growth_percentage.toString(),
        platform: trader.platform,
        rank_id: trader.rank_id
      });
    } else {
      setFormData({
        name: '',
        account_balance: '',
        growth_percentage: '',
        platform: 'MetaTrader 4',
        rank_id: ''
      });
    }
  }, [trader, mode, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      account_balance: parseFloat(formData.account_balance),
      growth_percentage: parseFloat(formData.growth_percentage),
      platform: formData.platform,
      rank_id: parseInt(formData.rank_id)
    });
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal trader-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add New Trader' : 'Update Trader'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter trader name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="platform">Platform</label>
                <input
                  type="text"
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="Enter trader platform"
                  required
                />
                {/* <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                >
                  <option value="MetaTrader 4">MetaTrader 4</option>
                  <option value="MetaTrader 5">MetaTrader 5</option>
                  <option value="cTrader">cTrader</option>
                  <option value="TradingView">TradingView</option>
                  <option value="NinjaTrader">NinjaTrader</option>
                </select> */}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="account_balance">Account Balance ($)</label>
                <input
                  type="number"
                  id="account_balance"
                  name="account_balance"
                  value={formData.account_balance}
                  onChange={handleChange}
                  placeholder="Enter account balance"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="growth_percentage">Growth Percentage (%)</label>
                <input
                  type="number"
                  id="growth_percentage"
                  name="growth_percentage"
                  value={formData.growth_percentage}
                  onChange={handleChange}
                  placeholder="Enter growth percentage"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="form-row">

              <div className="form-group">
                <label htmlFor="rank_id">Rank</label>
                <input
                  type="number"
                  id="rank_id"
                  name="rank_id"
                  value={formData.rank_id}
                  onChange={handleChange}
                  placeholder="Enter rank"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {mode === 'add' ? 'Add Trader' : 'Update Trader'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TraderModal;
