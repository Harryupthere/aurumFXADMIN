import React, { useMemo, useState } from "react";
import styled from "styled-components";
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

// Draggable row
function DraggableTableRow({ row }) {
   const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: row.original.id }); // <-- use imported hook directly

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
          {cell.render("Cell")}
        </td>
      ))}
    </tr>
  );
}

// Static row for drag overlay
function StaticTableRow({ row }) {
  return (
    <tr style={{ outline: "2px solid #3e1eb3", background: "#fff" }} {...row.getRowProps()}>
      {row.cells.map((cell, i) => (
        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
      ))}
    </tr>
  );
}

// Main table component
export function DragDropTableDemo() {
  // Sample columns and data
  const columns = useMemo(
    () => [
      { Header: "First Name", accessor: "firstName" },
      { Header: "Last Name", accessor: "lastName" },
      { Header: "Age", accessor: "age" }
    ],
    []
  );
  const initialData = [
    { id: "1", firstName: "Alice", lastName: "Smith", age: 28 },
    { id: "2", firstName: "Bob", lastName: "Brown", age: 32 },
    { id: "3", firstName: "Charlie", lastName: "Davis", age: 24 },
    { id: "4", firstName: "David", lastName: "Evans", age: 40 }
  ];
  const [data, setData] = useState(initialData);
  const [activeId, setActiveId] = useState(null);

  // React Table setup
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data });

  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );
  const items = useMemo(() => data.map((row) => row.id), [data]);

  // Drag events
  function handleDragStart(event) {
    setActiveId(event.active.id);
  }
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setData((prev) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  }
  function handleDragCancel() {
    setActiveId(null);
  }

  // Overlay row
  const selectedRow = useMemo(() => {
    if (!activeId) return null;
    const row = rows.find(({ original }) => original.id === activeId);
    if (row) prepareRow(row);
    return row;
  }, [activeId, rows, prepareRow]);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Demo: Dnd-kit Drag & Drop Table</h2>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
      >
        <table {...getTableProps()} style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 8px #eee" }}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} style={{ padding: 8, border: "1px solid #eee" }}>
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              {rows.map((row) => {
                prepareRow(row);
                return <DraggableTableRow key={row.original.id} row={row} />;
              })}
            </SortableContext>
          </tbody>
        </table>
        <DragOverlay>
          {activeId && selectedRow && (
            <table style={{ width: "100%" }}>
              <tbody>
                <StaticTableRow row={selectedRow} />
              </tbody>
            </table>
          )}
        </DragOverlay>
      </DndContext>
      {/* Example "Save" button if order changed */}
      <button
        style={{ marginTop: 16 }}
        disabled={JSON.stringify(data) === JSON.stringify(initialData)}
        onClick={() => alert("Call your API here with new order!")}
      >
        Save Order
      </button>
    </div>
  );
}