import { useEffect } from "react";
import { ToolOutlined } from "@ant-design/icons";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

/** Stand-in for sections of the shell that aren't built yet. */
const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  useEffect(() => {
    document.title = `${title} · Fertilizer Robot Control`;
  }, [title]);

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <div className="box box__blank">
        <ToolOutlined />
        <h3>Not built yet</h3>
        <p>This section is part of the layout but has no features yet.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
