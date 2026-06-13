import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          Freevid
        </Link>
        <Link to="/upload" className="btn btn-primary">
          Upload
        </Link>
      </div>
    </header>
  );
}
