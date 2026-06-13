import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Watch from './pages/Watch';

export default function App() {
  return (
    <HashRouter>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
