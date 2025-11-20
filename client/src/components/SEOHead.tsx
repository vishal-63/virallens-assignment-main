import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({
  title = "Virallens Marketing Bot - AI-Powered Marketing Assistant",
  description = "Get expert marketing advice instantly with Virallens Marketing Bot. AI-powered marketing assistant for strategies, campaigns, analytics, and best practices.",
  keywords = "marketing bot, AI marketing assistant, marketing strategies, digital marketing, marketing campaigns, marketing analytics, marketing automation, Virallens",
  image = "/viral.webp",
  url = "https://virallens.com",
  type = "website"
}: SEOHeadProps) => {
  const fullTitle = title.includes('Virallens') ? title : `${title} | Virallens Marketing Bot`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={`${title} - Virallens Marketing Bot`} />
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={`${title} - Virallens Marketing Bot`} />
    </Helmet>
  );
};

export default SEOHead;
