import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Priority color lookup table
const priorityColors = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const KanbanCard = ({ application, onClick, borderClass }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Make card transparent while dragging so drop target is visible
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(application)}
      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all group ${borderClass}`}
    >
      {/* Company & Role */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {application.company}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
          {application.role}
        </p>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority */}
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[application.priority]}`}
        >
          {application.priority}
        </span>

        {/* Job Type */}
        {application.jobType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {application.jobType}
          </span>
        )}

        {/* Match Score */}
        {application.matchScore !== null &&
          application.matchScore !== undefined && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
                application.matchScore >= 40
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
            >
              {application.matchScore}% match
            </span>
          )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        {/* Applied date */}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(application.appliedDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>

        {/* Notes count */}
        {application.notes?.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {application.notes.length} note
            {application.notes.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;