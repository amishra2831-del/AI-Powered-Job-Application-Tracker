import { useState } from "react";
import Layout from "../components/layout/Layout.jsx";
import KanbanBoard from "../components/kanban/KanbanBoard.jsx";
import ApplicationModal from "../components/applications/ApplicationModal.jsx";
import DetailDrawer from "../components/applications/DetailDrawer.jsx";

const Board = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <Layout>
      <div className="p-6">
        <KanbanBoard
          onCardClick={(app) => setSelectedApp(app)}
          onAddClick={() => setShowAddModal(true)}
        />
        {showAddModal && (
          <ApplicationModal onClose={() => setShowAddModal(false)} />
        )}
        {selectedApp && (
          <DetailDrawer
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Board;