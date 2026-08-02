import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import KanbanColumn from "./KanbanColumn.jsx";
import KanbanCard from "./KanbanCard.jsx";
import { getApplications, updateStatus } from "../../api/applications.js";

const COLUMNS = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const KanbanBoard = ({ onCardClick, onAddClick }) => {
  const [activeApp, setActiveApp] = useState(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await getApplications();
      return res.data.data;
    },
  });

  const { mutate: moveCard } = useMutation({
    mutationFn: ({ id, status }) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
    },
    onError: () => {
      toast.error("Failed to move card");
      queryClient.invalidateQueries(["applications"]);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load applications</p>
      </div>
    );
  }

  const applications = data || [];

  const getColumnApps = (status) =>
    applications.filter((app) => app.status === status);

  const handleDragStart = (event) => {
    const app = applications.find((a) => a._id === event.active.id);
    setActiveApp(app);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const activeApp = applications.find((a) => a._id === active.id);
    if (!activeApp) return;

    // Check if dropped over a column
    let newStatus = null;
    if (COLUMNS.includes(over.id)) {
      newStatus = over.id;
    } else {
      // Dropped over a card — find which column that card is in
      const overApp = applications.find((a) => a._id === over.id);
      if (overApp) newStatus = overApp.status;
    }

    if (!newStatus || newStatus === activeApp.status) return;

    // Optimistic update
    queryClient.setQueryData(["applications"], (old) =>
      old.map((app) =>
        app._id === activeApp._id ? { ...app, status: newStatus } : app,
      ),
    );

    moveCard({ id: activeApp._id, status: newStatus });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {applications.length} application
            {applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Application
        </button>
      </div>

      {/* Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={getColumnApps(status)}
              onCardClick={onCardClick}
            />
          ))}
        </div>

        {/* Drag Overlay — shows card while dragging */}
        <DragOverlay>
          {activeApp ? (
            <div className="rotate-2 scale-105">
              <KanbanCard application={activeApp} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;