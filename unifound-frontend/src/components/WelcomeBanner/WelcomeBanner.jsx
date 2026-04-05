import { PackagePlus, PackageSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./WelcomeBanner.css";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const WelcomeBanner = ({
  userName = "Bryan",
  activeReports = 2,
  newMatches = 1,
}) => {
  const navigate = useNavigate();
  const greeting = getGreeting();

  return (
    <div className="wb-banner">
      <div className="wb-glow" />

      <div className="wb-content">
        <div className="wb-text">
          <p className="wb-greeting">{greeting}</p>
          <h1 className="wb-name">{userName}</h1>
          <p className="wb-sub">
            You have{" "}
            <strong>
              {activeReports} active report{activeReports !== 1 ? "s" : ""}
            </strong>
            {newMatches > 0 && (
              <>
                {" "}
                and{" "}
                <strong className="wb-match-highlight">
                  {newMatches} new match suggestion{newMatches !== 1 ? "s" : ""}
                </strong>
              </>
            )}
            .
          </p>
        </div>

        <div className="wb-actions">
          <button
            className="wb-btn wb-btn--primary"
            onClick={() => navigate("/report-item")}
          >
            <PackagePlus size={15} />
            Report Item
          </button>
          <button
            className="wb-btn wb-btn--secondary"
            onClick={() => navigate("/browse-items")}
          >
            <PackageSearch size={15} />
            Browse Items
          </button>
        </div>
      </div>

      <div className="wb-illustration">
        <div className="wb-circle wb-circle--lg" />
        <div className="wb-circle wb-circle--md" />
        <div className="wb-circle wb-circle--sm" />
        <PackageSearch className="wb-icon" size={64} />
      </div>
    </div>
  );
};

export default WelcomeBanner;
