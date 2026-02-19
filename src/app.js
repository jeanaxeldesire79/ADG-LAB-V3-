import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataPortal from './pages/DataPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/data" element={<DataPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
