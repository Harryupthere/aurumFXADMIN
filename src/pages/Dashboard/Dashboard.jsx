import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import TraderModal from '../../components/TraderModal/TraderModal';
import './Dashboard.scss';
import useApiRequest from "../../hook/useApiRequest";
import { API_ENDPOINTS } from "../../constants/endPoints";
import { successMsg, errorMsg } from "../../utils/customFn";
import { isloginSuccess } from "../../redux/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Dashboard = () => {
    // Initialize state and hooks
    const { fetchData } = useApiRequest();
    const { auth_token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [traders, setTraders] = useState([]);
    const [loader, setLoader] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedTrader, setSelectedTrader] = useState();

    useEffect(() => {
        fetchApi()
    }, [loader])
    const fetchApi = async () => {
        try {
            const response = await fetchData(API_ENDPOINTS.LEADERBOARD, navigate, "GET", {});
            if (response.success) {
                setTraders(response.data);
            } else {
                errorMsg(response.message);
            }
        } catch (error) {
            errorMsg(error.message);
        }
    }
    // Filter and paginate traders
    const filteredTraders = useMemo(() => {
        return traders.filter(trader =>
            trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trader.platform.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [traders, searchTerm]);

    const totalPages = Math.ceil(filteredTraders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTraders = filteredTraders.slice(startIndex, startIndex + itemsPerPage);

    const handleAddTrader = () => {
        setModalMode('add');
        setSelectedTrader(undefined);
        setIsModalOpen(true);
    };

    const handleEditTrader = (trader) => {
        setModalMode('edit');
        setSelectedTrader(trader);
        setIsModalOpen(true);
    };

    const handleDeleteTrader = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this trader?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            try {
                const response = await fetchData(API_ENDPOINTS.DELETE_LEADERBOARD + `/${id}`, navigate, "GET", {});
                if (response.success) {
                    setLoader(true); // trigger reload
                    successMsg('Trader deleted successfully');
                } else {
                    errorMsg(response.message);
                }
            } catch (error) {
                errorMsg(error.message);
            }
        }
    };

    const handleModalSubmit = async (traderData) => {
        try {
            setLoader(true);
            setIsModalOpen(false);
            setSelectedTrader(null);
            if (modalMode === 'add') {
                let addTrader = await fetchData(API_ENDPOINTS.ADD_LEADERBOARD, navigate, "POST", traderData);
                if (addTrader.success) {
                    //setTraders([...traders, addTrader.data]);
                    setLoader(false);
                    successMsg('Trader added successfully');
                } else {
                    setLoader(false);
                    errorMsg(addTrader.message);
                }
            } else if (selectedTrader) {
                let updateTrader = await fetchData(API_ENDPOINTS.UPDATE_LEADERBOARD+ `/${selectedTrader.id}`, navigate, "PUT", traderData);
                if (updateTrader.success) {
                    setLoader(false);
                    successMsg('Trader updated successfully');
                } else {
                    setLoader(false);
                    errorMsg(updateTrader.message);
                }
            }

        } catch (error) {
            setLoader(false);
            errorMsg(error.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Layout title="Leaderboard">
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Forex Trading Leaderboard</h1>
                </div>
                <div className="leaderboard-card card">
                    <div className="card-header">
                        <h2>Top Traders</h2>
                        <button className="btn btn-primary" onClick={handleAddTrader}>
                            Add Trader
                        </button>
                    </div>
                    <div className="table-filters">
                        <div className="search-input">
                            <input
                                type="text"
                                placeholder="Search traders or platforms..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                    {paginatedTraders.length > 0 ? (
                        <>
                            <div className="table-responsive">
                                <table className="leaderboard-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Name</th>
                                            <th>Account Balance</th>
                                            <th>Growth Percentage</th>
                                            <th>Platform</th>
                                            <th>Created At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTraders.map((trader, index) => (
                                            <tr key={trader.id}>
                                                <td>{startIndex + index + 1}</td>
                                                <td>{trader.name}</td>
                                                <td className="balance-cell">{formatCurrency(trader?.account_balance)}</td>
                                                <td className={trader.growth_percentage >= 0 ? 'positive' : 'negative'}>
                                                    {trader.growth_percentage}%
                                                </td>
                                                <td>{trader.platform}</td>
                                                <td>{formatDate(trader.created_at)}</td>
                                                <td>
                                                    <button className="btn btn-edit" onClick={() => handleEditTrader(trader)}>
                                                        ✏️
                                                    </button>
                                                    <button className="btn btn-delete" onClick={() => handleDeleteTrader(trader.id)}>
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="pagination">
                                <div className="pagination-info">
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTraders.length)} of {filteredTraders.length} entries
                                </div>
                                <div className="pagination-controls">
                                    <button
                                        className="btn page-btn"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ‹
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            className={`btn page-btn ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        className="btn page-btn"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <h3>No traders found</h3>
                            <p>No traders match your search criteria. Try adjusting your search or add a new trader.</p>
                            <button className="btn btn-primary" onClick={handleAddTrader}>
                                Add First Trader
                            </button>
                        </div>
                    )}
                </div>
                <TraderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    trader={selectedTrader}
                    mode={modalMode}
                />
            </div>
        </Layout>
    );
};

export default Dashboard;
