import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectManager } from '@pages/ProjectManager/ProjectManager';
import { Editor }         from '@pages/Editor/Editor';
import { useAppStore }    from '@store/useAppStore';

// HashRouter usado para evitar problemas de roteamento em ambientes sem configuração de servidor (como Electron ou GitHub Pages).
export default function App() {
  const projetoAberto = useAppStore((s) => s.projetoAberto);

  return (
    <HashRouter>
      <Routes>
        <Route path="/"       element={<ProjectManager />} />
        <Route path="/editor" element={projetoAberto ? <Editor /> : <Navigate to="/" replace />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}