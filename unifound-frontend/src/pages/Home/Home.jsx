import React from "react";
import "./Home.css";
import HomeHero from "../../components/Hero/HomeHero";
import StepCard from "../../components/StepCard/StepCard";
import CallToAction from "../../components/CallToAction/CallToAction";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import SectionLabel from "../../components/SectionLabel/SectionLabel";

const Home = () => {
  return (
    <>
      <div className="home-container">
        <HomeHero />
        <SectionLabel label="Steps" />
        <SectionHeader
          title="How It"
          highlight="Works"
          subtitle="Simple steps to find and return lost items."
        />
        <StepCard />
        <CallToAction
          variant="home"
          title="Find what you’ve lost fast."
          subtitle="Join UniFound and reconnect with your belongings today."
          to="/signup"
          buttonText="Get Started"
        />
      </div>
    </>
  );
};

export default Home;
