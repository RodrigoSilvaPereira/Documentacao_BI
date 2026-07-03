import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectManager } from '@pages/ProjectManager/ProjectManager';
import { Editor }         from '@pages/Editor/Editor';
import { useAppStore }    from '@store/useAppStore';
import { UpdateModal }    from '@components/update/UpdateModal';

export default function App() {
  const projetoAberto = useAppStore((s) => s.projetoAberto);

  return (
    <HashRouter>
      <Routes>
        <Route path="/"       element={<ProjectManager />} />
        <Route path="/editor" element={projetoAberto ? <Editor /> : <Navigate to="/" replace />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>

      {/* Fora do Routes — sempre montado, independente da rota atual */}
      <UpdateModal />
    </HashRouter>
  );
}