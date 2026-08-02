import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard.jsx";

const columnStyles = {
  Saved: {
    header: "bg-gray-100 dark:bg-gray-800",
    dot: "bg-gray-400",
    count: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    border: 'border-gray-300 dark:border-gray-600',
  },
  Applied: {
    header: "bg-blue-50 dark:bg-blue-900/20",
    dot: "bg-blue-500",
    count: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    border: 'border-blue-300 dark:border-blue-600',
  },
  Interview: {
    header: "bg-yellow-50 dark:bg-yellow-900/20",
    dot: "bg-yellow-500",
    count:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    border: 'border-yellow-300 dark:border-yellow-600',
  },
  Offer: {
    header: "bg-green-50 dark:bg-green-900/20",
    dot: "bg-green-500",
    count:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    border: 'border-green-300 dark:border-green-600',
  },
  Rejected: {
    header: "bg-red-50 dark:bg-red-900/20",
    dot: "bg-red-500",
    count: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    border: 'border-red-300 dark:border-red-600',
  },
};

const KanbanColumn = ({ status, applications, onCardClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const style = columnStyles[status];

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${style.header}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {status}
          </h2>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.count}`}
        >
          {applications.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 flex-1 min-h-24 rounded-xl p-2 transition-colors ${
          isOver
            ? "bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-300 dark:border-blue-700"
            : "border-2 border-transparent"
        }`}
      >
        <SortableContext
          items={applications.map((app) => app._id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard key={app._id} application={app} onClick={onCardClick} borderClass={style.border} />
          ))}
        </SortableContext>

        {/* Empty State */}
        {applications.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-400 dark:text-gray-600">
            No applications
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;