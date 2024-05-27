import { Link } from "react-router-dom";
import "./navbar.css";


const Navbar = () => {
  
  return (
    <div>
      <div className="navbar">
        <a href="/" className="h-auto w-auto flex flex-row items-center">
          <img
            src="/logoD.webp"
            alt="logo"
            width={40}
            height={10}
            className="cursor-pointer animate-pulse"
          />
        </a>
        <ul>
          <li className="lefts">
            <Link className="btn btn-success" to="/userClaim">
              ClaimAirdrop
            </Link>
          </li>
          <li>
            <Link className="btn btn-success" to="/userAirdropData">
              CreateAirdop
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
