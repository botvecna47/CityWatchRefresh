import './Spinner.css';

export function Spinner({ size = 'md', className = '' }) {
  return (
    <div className={`spinner spinner-${size} ${className}`}>
      <div className="spinner-circle"></div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
      <p>Loading...</p>
    </div>
  );
}
