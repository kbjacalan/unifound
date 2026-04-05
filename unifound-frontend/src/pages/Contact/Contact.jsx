import "./Contact.css";
import SectionLabel from "../../components/SectionLabel/SectionLabel";
import FAQCard from "../../components/FAQCard/FAQCard";
import InfoCard from "../../components/InfoCard/InfoCard";
import FormCard from "../../components/FormCard/FormCard";
const Contact = () => {
  return (
    <>
      <div className="contact-container">
        <SectionLabel label="✦ Contact" />
        <div className="contact-layout">
          <div className="info-col">
            <InfoCard
              icon="✉️"
              label="Email"
              value="unifound@gmail.com"
              subtitle="We reply within 24 hours"
            />
            <InfoCard
              icon="📍"
              label="Campus"
              value="JRMS University Main Campus"
              subtitle="Dapitan City, Philippines"
            />
            <InfoCard
              icon="🕐"
              label="Support Hours"
              value="Mon – Fri, 8am – 6pm"
              subtitle="PST · Philippine Standard Time"
            />
            <FAQCard />
          </div>
          <FormCard />
        </div>
      </div>
    </>
  );
};

export default Contact;
