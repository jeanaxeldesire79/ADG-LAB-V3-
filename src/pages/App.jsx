import { Routes, Route } from 'react-router-dom';
import DataPortal from './pages/DataPortal';

function App() {
  return (
    <Routes>
      {/* Your other routes */}
      <Route path="/data" element={<DataPortal />} />
    </Routes>
  );
}

export default App;
