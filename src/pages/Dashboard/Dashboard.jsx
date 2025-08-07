import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import TraderModal from '../../components/TraderModal/TraderModal';
import './Dashboard.scss';
import useApiRequest from "../../hook/useApiRequest";
import { API_ENDPOINTS } from "../../constants/endPoints";
import { successMsg, errorMsg } from "../../utils/customFn";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { allCountries } from 'country-telephone-data';
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    KeyboardSensor,
    DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useTable } from "react-table";
import { useSortable } from "@dnd-kit/sortable";

// Drag handle icon
const DragHandle = (props) => (
    <span {...props} style={{ cursor: "grab", marginRight: 8 }}>☰</span>
);

// Draggable row for traders
function DraggableTraderRow({ row, onEdit, onDelete }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
        useSortable({ id: row.original.id });
    const style = {
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition,
        background: isDragging ? "#e3f2fd" : "white",
        cursor: "grab"
    };
    return (
        <tr ref={setNodeRef} style={style} {...row.getRowProps()}>
            {row.cells.map((cell, i) => (
                <td {...cell.getCellProps()}>
                    {i === 0 && <DragHandle {...attributes} {...listeners} />}
                    {cell.column.id === "action"
                        ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-edit" onClick={() => onEdit(row.original)}>
                                    ✏️
                                </button>
                                <button className="btn btn-delete" onClick={() => onDelete(row.original.id)}>
                                    🗑️
                                </button>
                            </div>
                        )
                        : cell.render("Cell")
                    }
                </td>
            ))}
        </tr>
    );
}

// Static row for drag overlay
function StaticTraderRow({ row }) {
    return (
        <tr style={{ outline: "2px solid #3e1eb3", background: "#fff" }} {...row.getRowProps()}>
            {row.cells.map((cell, i) => (
                <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
            ))}
        </tr>
    );
}

const Dashboard = () => {
    const { fetchData } = useApiRequest();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [traders, setTraders] = useState([]);
    const [loader, setLoader] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedTrader, setSelectedTrader] = useState();
    const [activeId, setActiveId] = useState(null);

    // Drag-and-drop state
    const [dndTraders, setDndTraders] = useState([]);
    const [initialOrder, setInitialOrder] = useState([]);

    useEffect(() => {
        fetchApi();
    }, [loader]);
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
    };

    // Sync dndTraders with traders from API
    useEffect(() => {
        setDndTraders(traders);
        setInitialOrder(traders.map(t => t.id));
    }, [traders]);

    // Filter traders
    const filteredTraders = useMemo(() => {
        return dndTraders.filter(trader => {
            const countryObj = allCountries.find(c => c.iso2 === trader.country_name);
            const countryDisplayName = countryObj ? countryObj.name.toLowerCase() : '';
            return (
                trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trader.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                countryDisplayName.includes(searchTerm.toLowerCase()) ||
                trader.rank_id.toString().includes(searchTerm.toLowerCase())
            );
        });
    }, [dndTraders, searchTerm, allCountries]);

    // Table columns
    const traderColumns = useMemo(
        () => [
            { Header: "Rank", accessor: "rank_id" },
            {
                Header: "Country", accessor: "country_name", Cell: ({ value }) => (
                    value ? (
                        <>
                            <img
                                src={`https://flagcdn.com/w20/${value.toLowerCase()}.png`}
                                alt={value}
                                className="country-flag"
                                style={{ marginRight: 6, verticalAlign: 'middle' }}
                            />
                            {allCountries.find(c => c.iso2 === value)?.name || value.toUpperCase()}
                        </>
                    ) : null
                )
            },
            { Header: "Name", accessor: "name" },
            { Header: "Account Balance", accessor: "account_balance", Cell: ({ value }) => formatCurrency(value) },
            {
                Header: "Growth %", accessor: "growth_percentage", Cell: ({ value }) => (
                    <span className={value >= 0 ? 'positive' : 'negative'}>{value}%</span>
                )
            },
            { Header: "Platform", accessor: "platform" },
            { Header: "Created At", accessor: "created_at", Cell: ({ value }) => formatDate(value) },
            {
                Header: "Action",
                accessor: "action",
                id: "action",
                Cell: () => null // handled in DraggableTraderRow
            }
        ],
        [allCountries]
    );

    // React Table setup
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({ columns: traderColumns, data: filteredTraders });

    // Dnd-kit sensors
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor)
    );
    const items = useMemo(() => filteredTraders.map((row) => row.id), [filteredTraders]);

    // Drag events
    function handleDragStart(event) {
        setActiveId(event.active.id);
    }
    function handleDragEnd(event) {
        const { active, over } = event;
        if (active.id !== over.id) {
            setDndTraders((prev) => {
                const oldIndex = prev.findIndex(t => t.id === active.id);
                const newIndex = prev.findIndex(t => t.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    }
    function handleDragCancel() {
        setActiveId(null);
    }

    const selectedRow = useMemo(() => {
        if (!activeId) return null;
        const row = rows.find(({ original }) => original.id === activeId);
        if (row) prepareRow(row);
        return row;
    }, [activeId, rows, prepareRow]);

    // Modal handlers
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
                    setLoader(false);
                    successMsg('Trader added successfully');
                } else {
                    setLoader(false);
                    errorMsg(addTrader.message);
                }
            } else if (selectedTrader) {
                let updateTrader = await fetchData(API_ENDPOINTS.UPDATE_LEADERBOARD + `/${selectedTrader.id}`, navigate, "PUT", traderData);
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

    // Save order button handler
    const handleSaveOrder = async () => {
        const reordered = dndTraders.map((trader, idx) => ({
            id: trader.id,
            rank_id: idx + 1
        }));
        try {
          let response = await fetchData(API_ENDPOINTS.UPDATE_LEADERBOARD_ORDER, navigate, "PUT", { order: reordered });
          if( response.success) {
            successMsg("Order saved!");
            setInitialOrder(dndTraders.map(t => t.id)); // update initial order
            setLoader(true); // reload data
          } else {
            errorMsg(response.message);
          }
        } catch (error) {
            errorMsg(error.message);
        }
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
                                }}
                            />
                        </div>
                    </div>
                    <div className="table-responsive">
                        <h2>Forex Trading Leaderboard </h2>
                        <DndContext
                            sensors={sensors}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <table {...getTableProps()} className="leaderboard-table">
                                <thead>
                                    {headerGroups.map((headerGroup) => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map((column) => (
                                                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                        {rows.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <DraggableTraderRow
                                                    key={row.original.id}
                                                    row={row}
                                                    onEdit={handleEditTrader}
                                                    onDelete={handleDeleteTrader}
                                                />
                                            );
                                        })}
                                    </SortableContext>
                                </tbody>
                            </table>
                            <DragOverlay>
                                {activeId && selectedRow && (
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <StaticTraderRow row={selectedRow} />
                                        </tbody>
                                    </table>
                                )}
                            </DragOverlay>
                        </DndContext>
                        <button
                            style={{ marginTop: 16 }}
                            disabled={JSON.stringify(dndTraders.map(t => t.id)) === JSON.stringify(initialOrder)}
                            onClick={handleSaveOrder}
                            className="btn btn-primary"
                        >
                            Save Order
                        </button>
                    </div>
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
