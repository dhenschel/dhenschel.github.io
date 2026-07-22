export const siteMetadata = {
  url: "https://dhenschel.de/",
  name: "D. Henschel",
  defaultTitle: "D. Henschel | Software Developer & Web-Projekte",
  defaultDescription:
    "Das Portfolio von Daniel Henschel, Software Developer: interaktive Web-Projekte, Case Studies und Einblicke in Konzeption, Design und Entwicklung.",
  language: "de",
  locale: "de_DE",
  themeColor: "#0b0d10",
  socialImage: "/social-card.png",
  socialImageAlt:
    "D. Henschel – Software Developer. Digitale Produkte mit System und Charakter.",
  socialImageWidth: 1200,
  socialImageHeight: 630,
} as const;

export const siteProfile = {
  name: "dhenschel",
  displayName: "D. Henschel",
  fullName: "Daniel Henschel",
  role: "Software Developer",
  image: "/dhenschel.jpg?v=profile-2026",
  imageAlt: "Profilbild von D. Henschel",
  github: "https://github.com/dhenschel",
  contactEmail: "danielhenschel04@gmail.com",
} as const;

export const schemaIds = {
  person: `${siteMetadata.url}#person`,
  website: `${siteMetadata.url}#website`,
} as const;

export const personStructuredData = {
  "@type": "Person",
  "@id": schemaIds.person,
  name: siteProfile.fullName,
  alternateName: [siteProfile.displayName, siteProfile.name],
  url: siteMetadata.url,
  image: new URL(siteProfile.image, siteMetadata.url).href,
  jobTitle: siteProfile.role,
  sameAs: [siteProfile.github],
};

export const websiteStructuredData = {
  "@type": "WebSite",
  "@id": schemaIds.website,
  url: siteMetadata.url,
  name: siteMetadata.name,
  alternateName: "dhenschel.de",
  description: siteMetadata.defaultDescription,
  inLanguage: siteMetadata.language,
  publisher: { "@id": schemaIds.person },
};
