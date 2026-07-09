import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Watch from './pages/Watch';
import Embed from './pages/Embed';

function AppLayout() {
  const { pathname } = useLocation();
  const isEmbed = pathname.startsWith('/embed/');

  return (
    <>
      {!isEmbed && <Header />}
      <main className={isEmbed ? 'main-embed' : 'main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/embed/:id" element={<Embed />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}
