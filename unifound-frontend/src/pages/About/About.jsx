import "./About.css";
import AboutHero from "../../components/Hero/AboutHero";
import Mission from "../../components/Mission/Mission";
import SectionLabel from "../../components/SectionLabel/SectionLabel";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import Team from "../../components/Team/Team";
import CallToAction from "../../components/CallToAction/CallToAction";
const About = () => {
  return (
    <>
      <div className="about-container">
        <AboutHero />
        <Mission />
        <SectionLabel label="Team" />
        <SectionHeader
          title="The"
          highlight="Creators"
          subtitle="The team who made UniFound possible."
        />
        <Team />
        <CallToAction
          variant="about"
          eyebrow="Built by Students, For Students"
          title="Help us make campus life easier."
          subtitle="We're constantly improving UniFound. Have a suggestion or want to report a bug?"
          to="/contact"
          buttonText="Get in Touch ↗"
        />
      </div>
    </>
  );
};

export default About;
