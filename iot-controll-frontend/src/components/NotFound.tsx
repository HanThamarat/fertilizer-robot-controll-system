import { Link } from "react-router";

const NotFound = () => (
  <div className="page">
    <div className="box box__blank">
      <h3>Page not found</h3>
      <p>
        There's nothing at this address. <Link to="/">Go to Overview</Link>
      </p>
    </div>
  </div>
);

export default NotFound;
